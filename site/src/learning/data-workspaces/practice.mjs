export const practiceCases={
 'value-converters':[
  {title:'Preserve typed state while changing culture',change:'Switch the visual model between en-US and pl-PL, keeping 0.375 and one percentage digit.',expected:'The representation changes with culture while sourceUnchanged remains 0.375.',reason:'Formatting belongs to the presentation boundary. Locale-sensitive text is not a replacement for the numeric state.'},
  {title:'Reject an unsupported input deliberately',change:'Disable Compatible finite input in the model, then write a direct Convert test using a string instead of a double.',expected:'The model reports no conversion value; the C# converter returns the exact UnsetValue sentinel.',reason:'A sentinel participates in the binding protocol. It must not be replaced by a string that happens to have the same name.'}
 ],
 'paged-collections':[
  {title:'Handle a repeated page boundary',change:'Keep ten loaded records, request five, and repeat two boundary records.',expected:'Three records are newly accepted and two are recognized as duplicates.',reason:'Membership deduplication uses stable keys. It does not decide whether a duplicate carries fresher fields.'},
  {title:'Recognize a short final page',change:'Use 23 total records, 20 loaded, page size five, and no repeated boundary items.',expected:'The fixture returns three records and reaches its final offset.',reason:'This local fixture has a known extent. A production cursor API must use its own explicit next-cursor/has-more contract.'}
 ],
 'empty-loading-error':[
  {title:'Distinguish empty success from failure',change:'Compare Empty with Failure while three prior rows are available.',expected:'Empty success accepts zero rows. Failure with retention leaves three older rows and reports their status.',reason:'An empty successful answer is data. A failed request did not establish a new answer.'},
  {title:'Cancel a refresh without erasing work',change:'Load successfully in the Uno sample, start a refresh, and press Cancel request during its delay.',expected:'The request ends as cancelled and the accepted rows remain visible.',reason:'Cancellation is cooperative control flow, not evidence of a new successful result or a server failure.'}
 ],
 'optimistic-edits':[
  {title:'Separate validation from concurrency',change:'Use a draft that is too short while the base and current versions also differ.',expected:'Validation is rejected without changing the store. A valid longer draft still encounters the version conflict.',reason:'Passing input validation does not imply the editing base is current.'},
  {title:'Reload explicitly before a new edit',change:'Simulate an external update, attempt Save, then choose Discard draft and reload before editing again.',expected:'The failed save retains the original draft; explicit reload accepts the store snapshot as a new base.',reason:'Blindly refreshing only the expected version would hide changes the user has not reviewed.'}
 ],
 'batch-notifications':[
  {title:'Compare event sequences, not imaginary timings',change:'Replace 25 rows using both strategies.',expected:'Clear plus individual Adds produces 26 collection events; the custom replacement produces one Reset.',reason:'The consumer may do more work for a broad Reset. Neither count establishes frame time or selection retention.'},
  {title:'Lose a selected key in the new result',change:'Set selected key to four, then reduce replacement count to two.',expected:'The key cannot be resolved in the replacement dataset even with a stable-key policy.',reason:'Stable identity makes a decision possible; it does not invent an entity that is absent from the accepted data.'}
 ],
 'undo-redo':[
  {title:'Abandon an old future deliberately',change:'Commit A, B, and C; Undo to B; then commit D.',expected:'D becomes current and the redo future containing C is cleared.',reason:'This is a linear history. Keeping multiple futures would require an explicit branching-history model.'},
  {title:'Do not treat a no-op as a new edit',change:'Commit A and B, Undo to A, then commit A again.',expected:'The redo path to B remains available because the equal-value commit changes nothing.',reason:'No-op edits should not allocate redundant history or silently destroy a useful redo path.'}
 ]
};
