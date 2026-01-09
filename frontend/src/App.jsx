import React, { useState } from 'react'
import appSchema from "./data/simple-app.json";
import AppRenderer from './renderer/AppRenderer';

const App = () => {

  const [currentScreenId, setCurrentScreenId] = useState(
    appSchema.screens[0].id
  );


  return (
    <div style={{ padding: 20 }}>
      <AppRenderer
        schema={appSchema}
        currentScreenId={currentScreenId}
        onNavigate={setCurrentScreenId}
      />


      {/* <h3>Renderer Test</h3> */}
      {/* <pre>{JSON.stringify(appSchema, null, 2)}</pre> */}
    </div>
  )
}

export default App