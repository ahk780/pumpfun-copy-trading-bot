# Pumpfun Copy Trading Bot 🤖

A powerful and secure copy trading bot for Pump.fun that allows you to automatically replicate trades from any wallet. Built with real-time data from CoinVera and secure transaction execution through SolanaPortal.

[![Video Demo](https://img.shields.io/badge/Video-Demo-red)](https://drive.google.com/file/d/1VAbadMSu2ykRVV-1xjoC_KiKH4nvIvJK/view?usp=drive_link)

![Pumpfun Copy Trading Bot Dashboard](https://raw.githubusercontent.com/ahk780/pumpfun-copy-trading-bot/refs/heads/main/public/pumpfun-copy-trading-bot-preview-image.jpeg)

## 🌟 Features

- **Real-time Copy Trading**: Instantly replicate trades from any Pump.fun wallet
- **Secure Transactions**: All transactions are signed locally - your private key never leaves your device
- **Price Monitoring**: Real-time price tracking with automatic stop-loss and take-profit
- **Customizable Settings**: Adjust trade sizes, slippage, and risk management parameters
- **Live Trade Feed**: Monitor all trades in real-time
- **Position Management**: Track and manage your open positions
- **Detailed Logging**: Comprehensive logging system for monitoring bot activity
- **Mobile Responsive**: Works on all devices with a beautiful UI

## 🚀 Quick Start

### Prerequisites

1. Node.js (v16 or higher)
2. A Solana wallet with SOL for trading
3. CoinVera API key (for price data and trade signals)
4. Basic understanding of Pump.fun trading

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ahk780/pumpfun-copy-trading-bot.git
cd pumpfun-copy-trading-bot
```

2. Install dependencies:
```bash
npm install
```

3. Start the bot:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

## 🔑 Configuration

### Required Settings

1. **CoinVera API Key**
   - Visit [CoinVera](https://www.coinvera.io)
   - Create an account
   - Generate your API key
   - Enter it in the bot's configuration

2. **Wallet Setup**
   - Enter your Solana wallet address
   - Add your private key (stored locally only)
   - Set your desired buy amount in SOL

3. **Copy Trading Settings**
   - Enter the wallet address you want to copy trades from
   - Set your risk management parameters

### Configuration Parameters

| Parameter | Description | Default | Recommended |
|-----------|-------------|---------|-------------|
| Buy Amount | Amount of SOL to spend per trade | 0.1 | 0.1-1.0 |
| Stop Loss | Percentage to sell at a loss | 5% | 5-10% |
| Take Profit | Percentage to sell at a profit | 10% | 10-20% |
| Slippage | Maximum price slippage allowed | 20% | 10-20% |
| Jito Tip | Priority fee for faster execution | 0.0005 | 0.0005-0.001 |
| Timeout | Maximum time to hold a position | 60m | 30-120m |

## 🔒 Security Features

- **Local Key Storage**: Private keys are stored locally and never sent to any server
- **Secure Transactions**: All transactions are signed locally using SolanaPortal
- **No Data Collection**: The bot doesn't collect or store any personal data
- **Open Source**: Code is open for review and verification

## 🛠️ Technical Details

### Architecture

- **Frontend**: React with TypeScript
- **Backend**: Node.js WebSocket server
- **APIs**:
  - [CoinVera](https://www.coinvera.io) for real-time price data and trade signals
  - [SolanaPortal](https://docs.solanaportal.io) for secure transaction execution

### Key Components

1. **WebSocket Service**
   - Real-time trade monitoring
   - Price updates
   - Connection management

2. **Trading Service**
   - Order execution
   - Position management
   - Price monitoring

3. **Risk Management**
   - Stop-loss implementation
   - Take-profit execution
   - Position timeout handling

## 📊 Performance Monitoring

- Real-time PnL tracking
- Trade history
- Position monitoring
- Detailed logs

## ⚠️ Risk Warning

Trading cryptocurrencies involves significant risk. This bot is a tool to assist in trading but does not guarantee profits. Always:

- Start with small amounts
- Test thoroughly
- Monitor the bot's performance
- Never invest more than you can afford to lose

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Useful Links

- [Pump.fun](https://pump.fun)
- [CoinVera API Documentation](https://www.coinvera.io)
- [SolanaPortal API Documentation](https://docs.solanaportal.io)
- [Solana Documentation](https://docs.solana.com)

## 🎥 Video Tutorial

[Add your video link here] - Watch how to set up and use the bot step by step.

## 💬 Support

For support, please:
1. Check the [FAQ](#faq) section
2. Open an issue on GitHub
3. Join our community [https://t.me/ahk782]

## FAQ

### Common Questions

1. **Is my private key safe?**
   - Yes, private keys are stored locally and never sent to any server
   - All transactions are signed locally

2. **How do I get a CoinVera API key?**
   - Visit [CoinVera](https://www.coinvera.io)
   - Create an account
   - Navigate to API settings
   - Generate a new API key

3. **What's the minimum SOL needed?**
   - Recommended: 1 SOL for testing
   - Production: Depends on your trading strategy

4. **How do I choose a wallet to copy?**
   - Look for consistent performance
   - Check trading history
   - Consider risk level

5. **Can I run multiple instances?**
   - Yes, with different configurations
   - Each instance needs its own API key

## 🔄 Updates

Stay tuned for updates and new features. Follow us on:
- [GitHub](https://github.com/ahk780/pumpfu-copy-trading-bot)
- [Twitter](YOUR_TWITTER_LINK)
- [Discord](YOUR_DISCORD_LINK)
