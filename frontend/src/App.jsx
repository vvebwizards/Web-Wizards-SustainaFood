import { useEffect, useState } from 'react';
import API from './utils/api';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        API.get('/')
            .then((response) => setMessage(response.data))
            .catch((error) => console.error(error));
    }, []);

    return (
      <div>
          <h1>Response from Backend:</h1>
          <p>{message}</p>
      </div>
  );
}

export default App;
