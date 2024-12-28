# Discussion Agent Demo

This project is an AI wrapper specialized in creating chat scenarios for practicing languages. It leverages AI models to generate realistic conversation scenarios, allowing users to practice and improve their language skills through interactive dialogues with agentic chatbots.

It is built on a Vike+Vue framework.

## Features

- **Scenario Generation**: Generate realistic and creative chat scenarios based on user-defined goals and settings.
- **Multi-Message Generation**: Enable multi-message generation for more dynamic and engaging conversations.
- **Agent Profiles**: Define and customize agent profiles, including their stats, relations, and personalities.
- **User Profile**: Customize user profile settings to tailor the conversation experience.
- **Timer Functionality (WIP)**: Optionally enable timers for conversation scenarios to simulate real-time interactions.
- **Report Generation**: Generate detailed reports analyzing the user's performance in conversations.

## Website
A live demo of this project can be found at https://jibash.com.

## Getting Started
If you'd like to download this project and make your own additions, you can follow the standard procedure for any Node project.

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Google AI API Key

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/channelA9/jibash.git
    cd jibash
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

### Running the Application

To start the development server:
```sh
npm run dev
```

To build the project for production:
```sh
npm run build
```

To preview the production build:
```sh
npm run preview
```

To deploy the project to Cloudflare Pages:
```sh
npm run deploy
```

## Usage

1. Open the application in your browser.
2. Enter your API key and adjust the settings.
3. Describe the types of conversations or situations you'd like to practice.
4. Start generating scenarios and engage in conversations with the AI agents.
5. Review the generated reports to analyze your performance.

## Project Structure

- `ai/`: Contains the core AI logic and interfaces.
- `components/`: Vue components for the user interface.
- `layouts/`: Layout components for the application.
- `pages/`: Page components for different routes.
- `utils/`: Utility functions.
- `public/`: Static assets.
- `src/`: Source files for the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Google Generative AI](https://developers.google.com/generative-ai)
- [Vue.js](https://vuejs.org/)
- [Vike](https://vike.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
