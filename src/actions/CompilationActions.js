import * as ActionTypes from './ActionTypes';
import Store from '../store';
import axios from 'axios';
import Disassembler from '../utils/DisassemblerUtil';
import MappingActions from './MappingActions';

const CompilationActions = {

  compileSource() {
    console.log(`CompilationActions - compileSource()`);
    const source = Store.getState().SourceReducer.source;
    return dispatch => {
      axios.post(
        'http://localhost:1337',
        { source }
      )
      .then(response => {

        const resp = response.data

        // Parse output.
        let output; 
        let srcmap;
        if(resp.errors) output = resp.errors; // Just errors.
        else {

          // Parse json compilation results for binary and sourcemap.
          output = JSON.parse(resp.output);
          
          // Assuming there is only one contract, so get any key.
          let contract;
          for(var key in output.contracts) {
            contract = output.contracts[key];
          }
          output = contract['bin-runtime'];
          srcmap = contract['srcmap-runtime'];

          // Disassemble.
          output = Disassembler.disassemble(output);
        }

        dispatch(CompilationActions.sourceCompiled(output, srcmap || ''));

        // Compilation resets source mappings.
        dispatch(MappingActions.outputSelected({start: 0, end: 0}));
        dispatch(MappingActions.sourceSelected({start: 0, end: 0}));
      })
    }
  },

  sourceUpdated(source) {
    return { type: ActionTypes.SOURCE_UPDATED, source }
  },

  sourceCompiled(output, srcmap) {
    return { type: ActionTypes.SOURCE_COMPILED, output, srcmap }
  }
}

export default CompilationActions;