import React, { Component } from 'react';
import {Card, CardHeader, CardMedia, CardTitle, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Favorite from 'material-ui/svg-icons/action/favorite';
import Visibility from 'material-ui/svg-icons/action/visibility';
import './index.css';

// const article = {
//   source: {
//     id: 'bloomberg',
//     name: 'Bloomberg'
//   },
//   author: 'Steve Matthews, Matthew Boesler',
//   title: 'Fed Officials Warn That Tariff Brawl Clouds Interest-Rate Path',
//   description: 'Federal Reserve officials warn an escalating trade dispute between the U.S. and China is adding an unwelcome layer of uncertainty to an otherwise bright economic outlook, though it’s premature to say what the fallout means for jobs, inflation or monetary poli…',
//   url: 'https://www.bloomberg.com/news/articles/2018-04-04/fed-officials-say-china-tariff-brawl-clouds-interest-rate-path',
//   urlToImage: 'https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ia86ceYH9UfA/v0/1200x713.jpg',
//   publishedAt: '2018-04-04T17:19:20Z'
//   };

export default class Article extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: props.article.liked,
    };
  }

  handleLikeClick = () => {
    if (!this.state.liked) {
      this.setState({
        liked: true
      });
      fetch(`/api/like/${this.props.article._id}`, { method: 'POST'});

    }
  }

  render() {
    const { article } = this.props;
    // Formating publication date to suitable localization format
    const publicationDate = new Date(article.publishedAt).toLocaleString();
    // Formating article image if it represented by server response
    const articlePicture = article.urlToImage ?
      (
      <CardMedia>
        <img src={article.urlToImage}/>
      </CardMedia>
      )
      : null;
    return (
      <article className='article'>
        <Card>
          <CardHeader
            title={article.source.name}
            subtitle={publicationDate}/>
          {articlePicture}
          <CardTitle 
            title={article.title}
            subtitle={article.author}/>
          <CardText>
            {article.description}<br />
            <a 
              href={article.url} 
              target='_blank'
              className='read-more'>
              Read more</a>
          </CardText>
          <CardActions
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <FlatButton
              secondary={this.state.liked}
              icon={<Favorite />}
              label='LIKE'
              hoverColor='white'
              disableTouchRipple
              onClick={this.handleLikeClick}
              />
            <div className='views-container'>
              <Visibility 
                style={{marginRight: '5px', fill: 'gray'}}/> {article.numberOfViews}
            </div>
          </CardActions>
        </Card>
      </article>
    );
  }
}