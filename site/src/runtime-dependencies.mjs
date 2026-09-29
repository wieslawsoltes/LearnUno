/** Reviewed runtime package contract, shared with project export and build tests. */
export const runtimePackages=Object.freeze({
  'CommunityToolkit.Mvvm':'8.4.2',
  'Microsoft.Extensions.DependencyInjection':'10.0.12',
  'Microsoft.Extensions.Options':'10.0.12'
});
export function lessonPackages(lesson){
 const declarations=lesson?.packages??{};
 if(!declarations||typeof declarations!=='object'||Array.isArray(declarations))throw new TypeError('Invalid lesson package declarations.');
 return Object.entries(declarations).map(([name,version])=>{
  if(!Object.hasOwn(runtimePackages,name)||runtimePackages[name]!==version)throw new Error('Unsupported lesson dependency: '+name+' '+version);
  return {name,version};
 });
}
export function packageReferences(lesson){
 const packages=lessonPackages(lesson);
 return packages.length?'\n  <ItemGroup>\n'+packages.map(p=>`    <PackageReference Include="${p.name}" Version="${p.version}" />`).join('\n')+'\n  </ItemGroup>':'';
}
