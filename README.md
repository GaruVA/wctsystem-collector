## WCTSystem Collector

### Repository Overview
This repository contains the WCTSystem Collector project, written in TypeScript. It is a mobile application designed to help drivers manage their waste collection routes efficiently by providing real-time optimized routing, interactive map interfaces, and in-app reporting features.

### Installation
1. **Clone the repository:**
    ```sh
    git clone https://github.com/GaruVA/wctsystem-collector.git
    cd wctsystem-collector
    ```

2. **Install the dependencies:**
    ```sh
    npm install
    ```

### Usage
To start the project, run:
```sh
npx expo start
```
- **Note**: If using `npx expo start`, you will need to have the Expo Go app installed on your mobile device and scan the QR code provided.
- Alternatively, to run on Android:
    ```sh
    npx expo run:android
    ```
- **Note**: If using `npx expo run:android`, ensure that the Android emulator is open and configured.

### Developer Guidelines
#### Project Structure
- `src/`: Contains all the source code.
  - `components/`: Reusable React components.
  - `screens/`: Different screens of the application.
  - `services/`: Services for API calls using Axios.
  - `App.tsx`: Main entry point for the application.

#### Running the Backend
Ensure that the backend Node.js server is running. Follow the instructions in the [backend README](https://github.com/GaruVA/wctsystem-backend/blob/master/README.md).

#### Development Setup
1. **API Endpoints**: Define API endpoints in the backend and access them using Axios in the frontend.
2. **Using Axios**: Axios is a promise-based HTTP client for the browser and Node.js.
    - **Installation**: Axios is already included in the dependencies.
    - **Usage Example**:
      ```typescript
      import axios from 'axios';
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/bins');
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      ```
3. **Accessing Backend from Different Devices**:
    - If running the app on a different device (e.g., using Expo Go or Android Studio), ensure the device and the computer running the backend are on the same network.
    - Use the private IP address of the computer running the backend in the Axios requests.

**Why use the private IP address?**
- When you run the backend server on your local machine, it is only accessible via `localhost` on that machine. Other devices on the same network can reach it using the private IP address of the machine running the backend.

### Progress
- The React Native app has been initialized with some dependencies and Expo.
- Implemented login functionality for drivers, allowing secure access to the app and personalized routes.
