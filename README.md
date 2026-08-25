# 250SKlassfika

## Setup

1. In Firebase project `fir-klassfika`, register a Web app (Project settings > General > Your apps).
2. Copy its `apiKey` and `appId` into `app.js`; these two values were not included in the supplied configuration. The project ID, sender ID, and Realtime Database URL are already filled in.
3. Enable Realtime Database and set database rules appropriate for your class. The page uses the `/Members/{member name}` path.
4. You can open `index.html` directly from your computer. If your browser still blocks Firebase requests from `file://`, serve this folder from a local web server instead. For example, with Python:

	```text
	python -m http.server 8000
	```

Open `http://localhost:8000` in a browser. Each member entry has this shape:

```text
/Members/{member name}/cookie value: number
/Members/{member name}/shadow value: number
```

Prompt 1:
generate a html file and a javascript file. The website is going to display two names which are supposed to bring cookies each week. The names should be decided via firebase. Each name should have a value for the total amount of times they have given cookies and a shadow value that decides who brings cookies upon it being a tie. The names that bring cookies should be ones that done it the least amount of time. There should be a add member form containing just the name. It will save the cookie value 0 and shadow value n where n is the number of people including the new one. There should be a scramble shadow value button which scrables the values at random (note that no two people can share a shadow value) The should be a list in the website displaying the names, the cookie value and the shadow value of each member. It should also contain the option to remove a member.  

