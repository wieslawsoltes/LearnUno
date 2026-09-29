/** Actual GPU tile classification. The algorithm is mirrored in models.mjs for evidence. */
export class DamageGpu {
  constructor(canvas,onStatus){this.canvas=canvas;this.onStatus=onStatus;this.alive=true;this.pending=null;this.busy=false;this.sequence=0;}
  async initialize(){
    if(!navigator.gpu){this.onStatus('fallback','SVG + CPU · WebGPU unavailable');return;}
    try{
      const adapter=await navigator.gpu.requestAdapter();
      if(!adapter){this.onStatus('fallback','SVG + CPU · no adapter');return;}
      const device=await adapter.requestDevice();
      if(!this.alive){device.destroy();return;}this.device=device;
      device.addEventListener('uncapturederror',e=>{if(this.alive)this.onStatus('error','GPU validation: '+e.error.message);});
      device.lost.then(()=>{if(this.alive){this.device=null;this.onStatus('fallback','SVG + CPU · GPU device lost');}});
      const context=this.canvas.getContext('webgpu'),format=navigator.gpu.getPreferredCanvasFormat();
      context.configure({device,format,alphaMode:'opaque'});this.context=context;
      const module=device.createShaderModule({code:`
struct Params { previous: vec4<f32>, current: vec4<f32>, grid: vec4<u32> };
@group(0) @binding(0) var<uniform> p: Params;
@group(0) @binding(1) var<storage,read_write> flags: array<u32>;
fn hit(tile: vec4<f32>, r: vec4<f32>) -> bool {
 return (tile.x < r.x+r.z) && (tile.x+tile.z > r.x) && (tile.y < r.y+r.w) && (tile.y+tile.w > r.y);
}
@compute @workgroup_size(64) fn classify(@builtin(global_invocation_id) id: vec3<u32>){
 if(id.x >= p.grid.x*p.grid.y){return;}
 let xy=vec2<f32>(f32(id.x%p.grid.x),f32(id.x/p.grid.x))*f32(p.grid.z);
 let extent=min(vec2<f32>(f32(p.grid.z)),vec2<f32>(640.0,320.0)-xy);
 let tile=vec4<f32>(xy,extent);
 flags[id.x]=select(0u,1u,hit(tile,p.previous)) | select(0u,2u,hit(tile,p.current));
}`});
      const renderModule=device.createShaderModule({code:`
struct Params { previous: vec4<f32>, current: vec4<f32>, grid: vec4<u32> };
@group(0) @binding(0) var<uniform> p: Params;
@group(0) @binding(1) var<storage,read> flags: array<u32>;
struct Out { @builtin(position) position:vec4<f32>, @location(0) @interpolate(flat) flag:u32 };
@vertex fn vertexMain(@builtin(vertex_index) vi:u32,@builtin(instance_index) instance:u32)->Out{
 let corners=array<vec2<f32>,6>(vec2<f32>(0,0),vec2<f32>(1,0),vec2<f32>(0,1),vec2<f32>(0,1),vec2<f32>(1,0),vec2<f32>(1,1));
 let origin=vec2<f32>(f32(instance%p.grid.x),f32(instance/p.grid.x))*f32(p.grid.z);
 let xy=origin+vec2<f32>(1.0)+corners[vi]*(f32(p.grid.z)-2.0);
 var o:Out;o.position=vec4<f32>(xy.x/320.0-1.0,1.0-xy.y/160.0,0,1);o.flag=flags[instance];return o;
}
@fragment fn fragmentMain(i:Out)->@location(0) vec4<f32>{
 var c=vec3<f32>(0.93,0.95,0.95);
 if(i.flag==1u){c=vec3<f32>(0.93,0.70,0.49);}else if(i.flag==2u){c=vec3<f32>(0.42,0.74,0.70);}else if(i.flag==3u){c=vec3<f32>(0.47,0.49,0.85);}
 return vec4<f32>(c,1);
}`});
      this.compute=await device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'classify'}});
      this.render=await device.createRenderPipelineAsync({layout:'auto',vertex:{module:renderModule,entryPoint:'vertexMain'},fragment:{module:renderModule,entryPoint:'fragmentMain',targets:[{format}]},primitive:{topology:'triangle-list'}});
      if(!this.alive)return;
      this.uniform=device.createBuffer({size:48,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
      this.flags=device.createBuffer({size:3200*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC});
      this.staging=device.createBuffer({size:3200*4,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});
      const entries=[{binding:0,resource:{buffer:this.uniform}},{binding:1,resource:{buffer:this.flags}}];
      this.cg=device.createBindGroup({layout:this.compute.getBindGroupLayout(0),entries});
      this.rg=device.createBindGroup({layout:this.render.getBindGroupLayout(0),entries});
      this.initialized=true;this.onStatus('ready','WebGPU · compute + render');this.drain();
    }catch(e){if(this.alive)this.onStatus('fallback','SVG + CPU · '+e.message.slice(0,100));this.device?.destroy();this.device=null;}
  }
  update(model){this.pending={model,revision:++this.sequence};this.drain();}
  async drain(){
    if(!this.initialized||!this.alive||this.busy||!this.device||!this.pending)return;
    this.busy=true;const {model:m,revision}=this.pending;this.pending=null;
    try{
      const buffer=new ArrayBuffer(48),f=new Float32Array(buffer),u=new Uint32Array(buffer);
      f.set([m.previous.x,m.previous.y,m.previous.w,m.previous.h,m.next.x,m.next.y,m.next.w,m.next.h]);u.set([m.cols,m.rows,m.cells[0].w,0],8);
      this.device.queue.writeBuffer(this.uniform,0,buffer);
      const encoder=this.device.createCommandEncoder();const cp=encoder.beginComputePass();cp.setPipeline(this.compute);cp.setBindGroup(0,this.cg);cp.dispatchWorkgroups(Math.ceil(m.cells.length/64));cp.end();
      const rp=encoder.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),loadOp:'clear',storeOp:'store',clearValue:{r:.98,g:.99,b:.99,a:1}}]});
      rp.setPipeline(this.render);rp.setBindGroup(0,this.rg);rp.draw(6,m.cells.length);rp.end();
      encoder.copyBufferToBuffer(this.flags,0,this.staging,0,m.cells.length*4);this.device.queue.submit([encoder.finish()]);
      await this.staging.mapAsync(GPUMapMode.READ,0,m.cells.length*4);
      const values=new Uint32Array(this.staging.getMappedRange(0,m.cells.length*4));const mismatch=m.cells.reduce((sum,c,i)=>sum+(c.flag!==values[i]?1:0),0);
      this.staging.unmap();
      if(this.alive && revision===this.sequence)this.onStatus(mismatch?'error':'verified',mismatch?`${mismatch} GPU/reference mismatches`:`WebGPU · ${m.cells.length} tiles checked · exact CPU match`,{revision,tiles:m.cells.length,dirty:m.dirty,mismatches:mismatch});
    }catch(e){if(this.alive)this.onStatus('error','GPU operation failed: '+e.message.slice(0,120));}
    finally{this.busy=false;if(this.alive)this.drain();}
  }
  dispose(){this.alive=false;this.pending=null;this.uniform?.destroy();this.flags?.destroy();this.staging?.destroy();this.device?.destroy();}
}
