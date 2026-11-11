#!/usr/bin/env python3
"""Crée un commit « Verified » à partir des fichiers indexés (git add), via l'API REST de GitHub.

Un commit fait avec `git commit` + `git push` dans un workflow n'est pas signé (« Unverified »).
Un commit créé par l'API avec le jeton du workflow (GITHUB_TOKEN), sans auteur imposé,
est signé par GitHub au nom de github-actions[bot] : il apparaît « Verified ».

Usage : commit_signe.py <branche> <message>
Variables : GITHUB_TOKEN (ou GH_TOKEN), GITHUB_REPOSITORY, GITHUB_API_URL (facultative).
La branche doit exister ; son dernier commit doit être le HEAD local (sinon : refus, rien n'est écrasé).
Après le commit, le dépôt local est remis sur le nouveau commit (git fetch + reset).
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

API = os.environ.get("GITHUB_API_URL", "https://api.github.com")
REPO = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ["GH_TOKEN"]


def api(method: str, path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        f"{API}/repos/{REPO}/{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2022-11-28"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as err:
        sys.exit(f"::error::API GitHub {method} {path} : {err.code} {err.read().decode(errors='replace')}")


def git(*args: str) -> str:
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout


def main() -> None:
    branch, message = sys.argv[1], sys.argv[2]
    head = git("rev-parse", "HEAD").strip()
    remote = api("GET", f"git/ref/heads/{branch}")["object"]["sha"]
    if remote != head:
        sys.exit(f"::error::{branch} a bougé sur GitHub ({remote[:10]}) depuis le checkout ({head[:10]}) : commit annulé")

    changes = [line.split("\t") for line in git("diff", "--cached", "--name-status", "--no-renames").splitlines()]
    if not changes:
        sys.exit("::error::aucun fichier indexé : rien à commiter")

    tree = []
    for status, path in changes:
        if status == "D":
            tree.append({"path": path, "mode": "100644", "type": "blob", "sha": None})
            continue
        mode = git("ls-files", "-s", "--", path).split()[0]
        with open(path, "rb") as fh:
            blob = api("POST", "git/blobs", {"content": base64.b64encode(fh.read()).decode(), "encoding": "base64"})
        tree.append({"path": path, "mode": mode, "type": "blob", "sha": blob["sha"]})

    base_tree = api("GET", f"git/commits/{head}")["tree"]["sha"]
    new_tree = api("POST", "git/trees", {"base_tree": base_tree, "tree": tree})["sha"]
    commit = api("POST", "git/commits", {"message": message, "tree": new_tree, "parents": [head]})
    api("PATCH", f"git/refs/heads/{branch}", {"sha": commit["sha"], "force": False})

    verified = commit.get("verification", {}).get("verified")
    print(f"Commit {commit['sha'][:10]} sur {branch} ({len(tree)} fichier(s)), signé : {verified}")
    git("fetch", "-q", "origin", branch)
    git("reset", "-q", "--hard", commit["sha"])


if __name__ == "__main__":
    main()
