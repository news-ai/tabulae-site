import React from 'react';

const FAQItem = ({youtubeUrl, title}) => {
  return <div style={{marginTop: 10, marginBottom: 10}}>
  <p>{title}</p>
  <iframe width='560' height='315' src={`https://www.youtube.com/embed/${youtubeUrl}`} frameBorder={0} allowFullScreen></iframe>
  </div>;
};

function FAQ(props) {
  return <div style={{margin: 10}}>
    <FAQItem youtubeUrl='AGPzplaLR1o' title='How to Email'/>
    <FAQItem youtubeUrl='xdVsRQG64-Y' title='How to Import Existing Excel Lists' />
    <FAQItem youtubeUrl='hpaHw751Qyw' title='How to Search' />
  </div>;
}

export default FAQ;
