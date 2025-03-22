# Portfolio Tracker

## Overview
The Portfolio Tracker is a web application that allows users to manage their stock investments. Users can add stocks, view their current value, and track performance metrics such as gain/loss and percentage change. The application also includes a feature to add notes related to each stock.

## Features
- Add stock details including name, price, and number of shares.
- View total invested amount, current value, and percentage change.
- Display a list of all stocks with their respective details.
- Open a dialog box to add notes for each stock, with timestamps for each note.
- Responsive design using Tailwind CSS for a modern user interface.

## Project Structure
```
portfolio-tracker
├── index.html          # Main HTML structure of the portfolio tracker page
├── css
│   └── tailwind.css    # Tailwind CSS framework styles
├── js
│   ├── app.js          # Main JavaScript entry point
│   ├── portfolio.js     # Functions related to portfolio management
│   └── dialog.js       # Dialog box functionality for notes
├── tailwind.config.js   # Configuration file for Tailwind CSS
├── package.json        # npm configuration file
└── README.md          # Documentation for the project
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd portfolio-tracker
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Build the Tailwind CSS:
   ```
   npx tailwindcss -i ./css/tailwind.css -o ./css/output.css --watch
   ```
5. Open `index.html` in your browser to view the application.

## Usage
- To add a stock, fill in the stock name, price, and number of shares in the provided form and submit.
- The portfolio metrics will automatically update to reflect the current state of your investments.
- Click on a stock to open the dialog box where you can add notes related to that stock.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.