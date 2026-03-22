==============================================
  CapitalIQ - How to Run (Windows)
==============================================

YOU NEED:
- Node.js installed (https://nodejs.org - download LTS version)

STEP 1:
  Extract this zip folder anywhere on your computer
  (Desktop is fine)

STEP 2:
  Double-click SETUP_AND_RUN.bat

  It will automatically:
  - Move the project to C:\myapp\capitaliq (clean path, no spaces)
  - Install all dependencies
  - Start the app

STEP 3:
  Browser opens at http://localhost:3000
  You will see the CapitalIQ login screen

TO STOP THE APP:
  Go to the black terminal window and press Ctrl+C

TO START IT AGAIN NEXT TIME:
  Open Command Prompt and type:
    cd C:\myapp\capitaliq
    npm start

==============================================
  SIGN IN OPTIONS
==============================================

AS A CUSTOMER:
  - Type any name and click "Continue with Demo Data"
  - No account or API key needed

AS A BANK EMPLOYEE (Admin / CRA):
  Use any of these name + ID combinations:
    Jack        E001   (CRA Officer)
    Sarah       E002   (Risk Analyst)
    Marcus      E003   (Community Dev Manager)
    Priya       E004   (Data Scientist)
    Tom         E005   (Branch Director)

  In the CRA Command Center, enter these ZIP codes
  to load zone data:
    37208  (North Nashville, TN)
    20020  (Anacostia, DC)
    37013  (Antioch, TN)
    30310  (Atlanta, GA)

==============================================
  WHAT WORKS WITHOUT AN API KEY
==============================================

  Everything works with synthetic data:
  - Dashboard, charts, transactions
  - Goals tracker
  - Life Stage Advisor
  - CRA Command Center
  - Card Analytics
  - Customer Spend + Excel export
  - Orchestrator (shows pipeline UI)

  AI chat features need an Anthropic API key:
  - AI Advisor agents
  - AI Bank Teller responses
  - CRA agent chat responses
  - Orchestrator AI synthesis
  Get a free key at: console.anthropic.com

==============================================
