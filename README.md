# News App
Test task for SmartexLab
working example on heroku: https://breakingnews-app.herokuapp.com/
## Plan
1) 02.04.2018 - Configure project structure, preparing boilerplate
2) 03.04.2018 - 07.04.2018 - Header, Footer components, wrapper for articles list
3) 07.04.2018 - 09.04.2018 - Article Component
4) 10.04.2018 - 13.04.2018 - Interaction with server. Server logic and interaction with newsAPI
5) 13.04.2018 - 15.04.2018 - Storage for number of views, visitors per day and "Liked" mark
6) 16.04.2018 - 17.04.2018 - Resolving possible unexpected issues

### Actual Work log
1) 02.04.2018 - Configure project structure, preparing boilerplate
2) 03.04.2018 - 07.04.2018 - Header, Footer components, wrapper for articles list
3) 07.04.2018 - 09.04.2018 - Article Component
4) 10.04.2018 - 13.04.2018 - Server api and interaction with newsAPI, db for storing articles with likes and numberOfViews
5) 13.04.2018 - 14.04.2018 - Interaction with frontend and backend
6) 14.04.2018 - Filter component and server logic
7) 15.04.2018 - Server logic refactoring, additional messages on search and end of articles in Main component
8) 16.04.2018 - Number of visitors per day, Filter logic rework, additional errors handlers and logging, refactoring
9) 17.04.2018 - Refactoring and bug fixing, preparing for deployment

#### Getting Started

git clone https://github.com/EmptyChild/news-app.git


##### Prerequisites

* Install [nodejs](https://nodejs.org/en/) (>= v6.9.4)
* open bash in this folder
* `npm install`

###### Run App
* Install and run MongoDB instance (https://www.mongodb.com/)
* Achive free NewsApi key (https://newsapi.org/)
* open bash in this folder
* `npm run build`
* Run `MONGO_URI=[your MongoDB instance URI] NEWS_API_KEY=[your NewsApi Key] npm run start` in your bash command shell
* open http://localhost:5000
