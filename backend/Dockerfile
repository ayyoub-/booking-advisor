FROM node:18-alpine

# Install Python and pip for the scraper
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create virtual environment and install Python dependencies
RUN python3 -m venv /venv
RUN /venv/bin/pip install beautifulsoup4==4.12.2 numpy requests PyYAML==6.0.1 python-dateutil==2.8.2 typer==0.9.0 typing-extensions==4.8.0

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server-simple.js"]
