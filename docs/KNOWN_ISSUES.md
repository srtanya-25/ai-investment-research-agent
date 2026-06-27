# Known Issues

A short record of the problems faced while building and deploying the project, and how each was fixed.

## 1. Backend wouldn't start on Render
The first deploy failed because the database wasn't ready yet, so the app couldn't connect to it. The fix was to wait for the database to finish setting up, copy its connection link into the backend settings, and deploy again.

## 2. The live site kept giving fallback results instead of real AI answers
Even after the Gemini key was added, the website kept showing the offline backup answers. The server was stuck on an old version of the code. Deploying the newest version brought the real AI results back. Lesson learnt: don't force-push a branch once a server is watching it.

## 3. Couldn't see why the AI was failing
The error messages weren't showing up in the server logs, which made it hard to debug. Adding a small bit of logging made the app print what was happening, so the problem became clear.

## 4. The website got blocked after going live
The frontend address ended up slightly different than expected (it had "-sandy" added). The backend was only allowing the old address, so the browser blocked everything. Updating the backend with the correct frontend address fixed it.

## 5. The site wouldn't run locally ("invalid regular expression")
The dev server crashed even though the online build worked fine. The problem wasn't the project code: one of the small libraries it depends on (browserslist) had a broken version. Locking it to the next, fixed version and reinstalling solved it.

## 6. Couldn't build Docker images locally
Building the Docker images on the laptop failed with a certificate error, because the security software on the machine was blocking the download. The cleaner fix was to let GitHub build and upload the images automatically in the cloud.

## 7. Wrong kind of Gemini key
The first key used was a temporary one that stops working after a while. Replacing it with a proper permanent key from Google AI Studio fixed it.

## 8. Pushing code to GitHub failed sometimes
A few pushes failed with a certificate error, again due to the security software on the machine. Retrying the push got it through.

## AI tools used

- **Claude** — coding help and debugging.
- **ChatGPT** — plain-language explanations of concepts.
- **GitHub Copilot** — inline code suggestions inside VS Code.
- **Google Gemini 2.5 Flash** — powers the research inside the app, called through LangChain.

## AI session screenshots

A few of the questions asked while building, kept as a record of the approach.

![Writing the Django service that calls Gemini with a fallback](screenshots/gemini-service.png)

![Debugging the Render database engine error](screenshots/render-db-engine.png)

![Understanding CORS between the frontend and backend](screenshots/cors.png)

![Understanding JWT login with cookies](screenshots/jwt-cookies.png)

![Fixing the Vite browserslist crash](screenshots/vite-browserslist.png)
