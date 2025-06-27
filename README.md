# Couple Dare Date - Truth or Dare Love Edition

A romantic truth or dare game for couples, now with online multiplayer support! 💕

## Features

- **Local Game Mode**: Play together on the same device
- **Online Multiplayer**: Play remotely with room codes
- **Real-time Synchronization**: Live updates between players
- **Beautiful UI**: Modern, romantic design with animations
- **Timer System**: 60-second explanation timer
- **Dare System**: Earn dares by skipping explanations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd couple-dare-date
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

#### Option 1: Local Game Only
If you only want to play locally (same device):

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

#### Option 2: Online Multiplayer
To enable online multiplayer:

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## How to Play Online

### Creating a Room
1. Click "Online Game" on the main menu
2. Click "Create Room"
3. Enter your name
4. Click "Create Room"
5. Share the room code with your partner

### Joining a Room
1. Click "Online Game" on the main menu
2. Click "Join Room"
3. Enter your name and the room code from your partner
4. Click "Join Room"

### Game Rules
- Ask your partner a question (anything you want to know!)
- They answer YES or NO only
- Then they have 60 seconds to explain why 💬⏳
- After 5 questions, get ready for a romantic dare! 🔥
- Skip explanations and face more dares! 😈

## Technical Details

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Socket.io-client for real-time communication
- Shadcn/ui components

### Backend
- Node.js with Express
- Socket.io for real-time communication
- CORS enabled for cross-origin requests
- Room management system

### Architecture
- **Room-based multiplayer**: Each game session has a unique room code
- **Real-time synchronization**: Game state updates instantly between players
- **Connection management**: Automatic handling of player disconnections
- **State persistence**: Game state maintained on the server

## Development

### Project Structure
```
couple-dare-date/
├── src/
│   ├── components/
│   │   ├── GameStart.tsx          # Game mode selection
│   │   ├── RoomManager.tsx        # Online room management
│   │   ├── OnlineGamePlay.tsx     # Online gameplay
│   │   ├── GamePlay.tsx           # Local gameplay
│   │   └── ...
│   ├── services/
│   │   └── socketService.ts       # Socket.io client service
│   └── ...
├── server/
│   ├── index.js                   # Socket.io server
│   └── package.json
└── ...
```

### Adding New Features
1. Frontend changes go in `src/`
2. Backend changes go in `server/`
3. Socket events are handled in `server/index.js`
4. Client-side socket handling in `src/services/socketService.ts`

## Deployment

### Frontend
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages

### Backend
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS

Remember to update the socket server URL in `src/services/socketService.ts` when deploying.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both local and online modes
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

Made with ❤️ for couples everywhere!
