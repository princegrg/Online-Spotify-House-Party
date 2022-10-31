import React, { Component } from 'react';
import {render} from 'react-dom';

import HomePage from './HomePage';


export class App extends Component {
  render() {
    return (
      <div className = 'center'>
        <HomePage></HomePage>
      </div>
      
      
      
    )
  }
}

const appDiv = document.getElementById('app');
render(<App/>,appDiv);


export default App