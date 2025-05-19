# KittyChat
React-based frontend for LLM chat interactions with a Hello Kitty theme.

## Installation
Clone and install dependencies:
```sh
git clone https://github.com/yourusername/llm_front-end.git
cd llm_front-end
npm install
```

Create a `.env` file in the root directory:
```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

Start the development servers:
```sh
npm run dev:all    # Start both frontend and backend
npm run dev        # Start only frontend
npm run server     # Start only backend
```

## Features
KittyChat provides a complete chat interface for interacting with large language models:

### Conversational UI
The application offers a clean, intuitive chat interface with real-time streaming responses. Messages appear character by character as the AI generates them, providing a natural conversational experience.

### Authentication & User Management
- Secure JWT-based authentication
- User registration and login
- Password reset functionality
- User profile customization

### Chat Functionality
- **Multiple Models**: Choose between different LLM models for responses
- **Chat History**: Browse and manage past conversations
- **Streaming Responses**: Real-time character-by-character display
- **Cancellable Requests**: Cancel AI responses mid-generation

### Markdown & Formatting Support
All AI responses support rich markdown formatting, including:
- Code syntax highlighting with multiple languages
- Mathematical expressions via KaTeX
- Tables, lists, and other formatting
- Auto-linking of URLs

## Architecture
KittyChat follows a modern React application architecture:

### Frontend Components
- **Chat Interface**: The main conversation view with messages and input
- **Sidebar**: Navigation and chat history access
- **User Settings**: Profile and preferences management
- **Authentication**: Login and registration flows

### Backend Services
- **Message Handling**: Storing and retrieving chat messages
- **LLM Integration**: Connection to OpenAI or other LLM providers
- **User Management**: Authentication and user data storage
- **MongoDB**: Database for persistent storage


## Project Structure
```
llm_front-end/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # React components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── models/          # Data models
│   ├── styles/          # SCSS stylesheets
│   ├── utils/           # Utility functions
│   ├── Main.jsx         # Main application component
│   └── index.css        # Global styles
├── index.html           # HTML entry point
└── vite.config.js       # Vite configuration
```


## Authors
- [Oleh Basystyi]()
- [Anna Stasyshyn]()
- [Anton Valihurskyi]()
## License
Can be found [here](./LICENSE).
