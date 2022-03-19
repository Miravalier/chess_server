#!/usr/bin/env python3
# PYTHON_ARGCOMPLETE_OK
import argcomplete, argparse
import requests
import sys
from dotenv import dotenv_values
from typing import Any


# Load .env
config = dotenv_values(".env")
try:
    http_port = int(config.get("HTTP_PORT", None))
except (TypeError, ValueError):
    print("error: invalid .env file; copy example.env to .env and edit it", file=sys.stderr)
    sys.exit(1)


def check_response_for_error(response: Any):
    if not response:
        print("error: no response received from server")
        sys.exit(1)
    elif "status" not in response:
        print("error:", response)
        sys.exit(1)
    elif response["status"] != "success":
        print(f'error: {response["reason"]}')
        sys.exit(1)


def query(endpoint: str):
    response = requests.get(f"http://127.0.0.1:{http_port}/admin/{endpoint}").json()
    check_response_for_error(response)
    return response


def command(endpoint: str, data: Any):
    response = requests.post(f"http://127.0.0.1:{http_port}/admin/{endpoint}", json=data).json()
    check_response_for_error(response)
    return response


def status(args):
    print(query("status"))


def list_players(args):
    if (args.pending and args.confirmed) or (not args.pending and not args.confirmed):
        response = query("list-players")
    elif args.pending:
        response = query("list-pending-players")
    elif args.confirmed:
        response = query("list-confirmed-players")

    if len(response["players"]) == 0:
        print("No results.")
    for player in response["players"].values():
        print(player)


def reset_db(args):
    print(query("reset-db"))


def delete_player(args):
    print(command("delete-player", {"name": args.name}))


def confirm_player(args):
    print(command("confirm-player", {"name": args.name}))


def main():
    parser = argparse.ArgumentParser()
    parser.set_defaults(func=lambda _: parser.print_help())
    subparsers = parser.add_subparsers()

    status_parser = subparsers.add_parser("status")
    status_parser.set_defaults(func=status)

    list_players_parser = subparsers.add_parser("list-players")
    list_players_parser.add_argument("-p", "--pending", action="store_true")
    list_players_parser.add_argument("-c", "--confirmed", action="store_true")
    list_players_parser.set_defaults(func=list_players)

    reset_db_parser = subparsers.add_parser("reset-db")
    reset_db_parser.set_defaults(func=reset_db)

    confirm_player_parser = subparsers.add_parser("confirm-player")
    confirm_player_parser.add_argument("name")
    confirm_player_parser.set_defaults(func=confirm_player)

    delete_player_parser = subparsers.add_parser("delete-player")
    delete_player_parser.add_argument("name")
    delete_player_parser.set_defaults(func=delete_player)

    argcomplete.autocomplete(parser)

    args = parser.parse_args()
    args.func(args)

    sys.exit(0)


if __name__ == '__main__':
    main()
