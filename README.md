# Dependencies

- General
  - make
- Frontend
  - nginx
- Backend
  - docker
  - docker-compose

# Testing locally

- `cp example.env .env`
- `make backend` (Sudo if the user is not a member of the docker group)
- `sudo make frontend`
- `sudo make nginx
- Navigate to `http://chess.local` in a browser
