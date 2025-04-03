import "./App.scss";
import { ComboBox } from "./combo-box";

const App = () => {

  return (
    <div className="center">
      <div className="container">
        
        <h2 className="mt-6">Options</h2>
        <ComboBox 
          placeholder="Select options..." 
          multiSelect={true}
        />
      </div>
    </div>
  );
};

export default App;