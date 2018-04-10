import React, { Component } from 'react';
import {Card, CardHeader, CardMedia, CardTitle, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Favorite from 'material-ui/svg-icons/action/favorite';
import Visibility from 'material-ui/svg-icons/action/visibility';
import './index.css';

const articleData = {
  source: {
    id: 'bloomberg',
    name: 'Bloomberg'
  },
  author: 'Steve Matthews, Matthew Boesler',
  title: 'Fed Officials Warn That Tariff Brawl Clouds Interest-Rate Path',
  description: 'Federal Reserve officials warn an escalating trade dispute between the U.S. and China is adding an unwelcome layer of uncertainty to an otherwise bright economic outlook, though it’s premature to say what the fallout means for jobs, inflation or monetary poli…',
  url: 'https://www.bloomberg.com/news/articles/2018-04-04/fed-officials-say-china-tariff-brawl-clouds-interest-rate-path',
  urlToImage: 'https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ia86ceYH9UfA/v0/1200x713.jpg',
  publishedAt: '2018-04-04T17:19:20Z'
  };

export default class Article extends Component {
  constructor(props) {
    super(props);
    this.state = {
      like: false,
    };
  }

  handleLikeClick = () => {
    this.setState({
      liked: true
    })
  }

  render() {
    // Formating publication date to suitable localization format
    const publicationDate = new Date(articleData.publishedAt).toLocaleString();
    // Formating article image if it represented by server response
    const articlePicture = articleData.urlToImage ?
      (
      <CardMedia>
        <img src={articleData.urlToImage}/>
      </CardMedia>
      )
      : null;
    return (
      <article>
        <Card>
          <CardHeader
            title={articleData.source.name}
            subtitle={publicationDate}/>
          {articlePicture}
          <CardTitle 
            title={articleData.title}
            subtitle={articleData.author}/>
          <CardText>
            {articleData.description}
            <a 
              href={articleData.url} 
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
                style={{marginRight: '5px', fill: 'gray'}}/> {87}
            </div>
          </CardActions>
        </Card>
      </article>
    );
  }
}