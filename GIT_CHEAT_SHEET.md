# Git Branching Cheat Sheet

This guide explains how to create and manage branches, specifically for working on the `frontend` and `backend` separately.

## 1. Creating the Frontend Branch
When you want to work on frontend features, you should create a branch off of `main` called `feature/frontend`.

```bash
# Make sure you are on main and up to date
git checkout main
git pull origin main

# Create a new branch called feature/frontend and switch to it
git checkout -b feature/frontend
```

## 2. Creating the Backend Branch
When you want to work on backend features, you should create a separate branch.

```bash
# Make sure you are on main and up to date
git checkout main
git pull origin main

# Create a new branch called feature/backend and switch to it
git checkout -b feature/backend
```

## 3. Checking Your Current Branch
To see which branch you are currently on, run:
```bash
git branch
```
*The branch with a `*` next to it is your current branch.*

## 4. Pushing a New Branch to GitHub
When you are ready to save your branch to GitHub, you need to push it. 
```bash
# Add your changes
git add .
git commit -m "My frontend changes"

# Push the branch to GitHub for the first time
git push -u origin feature/frontend
```

## 5. Switching Between Branches
You can easily switch back and forth between your branches without losing work (just make sure you commit your changes first!).
```bash
# Switch to the frontend branch
git checkout feature/frontend

# Switch to the backend branch
git checkout feature/backend

# Switch back to the main branch
git checkout main
```

## 6. Merging Neatly (The GitHub Way)
If you merge branches in your terminal using `git merge`, your commit history can quickly look like a messy spiderweb. 

The industry standard "neat" way to merge code is:
1. Push your branch to GitHub (like you just did!)
2. Go to your repository on GitHub.com and click the green **Compare & pull request** button.
3. Review your code in the PR (Pull Request).
4. Click the arrow next to the green Merge button and select **Squash and merge**.
   - *Why Squash?* It takes all the 50 messy little "WIP" or "typo fix" commits you made on your branch and squashes them into **ONE clean commit** on the `main` branch.
5. After it's merged on GitHub, go back to your terminal, delete the branch, and pull the latest code:

```bash
# Switch to main
git checkout main

# Get the clean, squashed code from GitHub
git pull origin main

# Delete your local feature branch since it is already merged
git branch -D feature/frontend
```
