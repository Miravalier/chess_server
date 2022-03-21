# Dependencies

- General
  - sudo apt install make
- Frontend
  - sudo apt install nginx
- Backend
  - sudo apt install docker
  - sudo apt install docker-compose
- Admin Script
  - pip3 install argcomplete
  - pip3 install requests
  - pip3 install python-dotenv

# Testing locally

- `cp example.env .env`
- `make backend` (Sudo if the user is not a member of the docker group)
- `sudo make frontend`
- `sudo make nginx`
- Navigate to `http://chess.local` in a browser

# Running in production

- `cp example.env .env`
- Register your domain for ReCAPTCHA (https://www.google.com/recaptcha/about/)
- Set RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY in the .env to the values you get from google.
- `make backend` (Sudo if the user is not a member of the docker group)
- `sudo make frontend`
- `sudo make nginx DOMAIN=<your_domain>`
- Navigate to `http://<your_domain>` in a browser
