import React from 'react';
import { DigioRNComponent } from 'digio-sdk-rn';
export default class Enach extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      digioDocumentId: 'ENA230117132943144ZBFQNRYXR6D2AP',
      digioUserIdentifier: '9891699153',
      //   digioLoginToken: 'Pass GWT token Id here',
      options: {
        environment: 'production',
        logo: 'yourlogourl',
        theme: {
          primaryColor: '#234FDA',
          secondaryColor: '#234FDA',
        },
      },
    };
  }

  onSuccess = (t) => {
    console.log(t + ' Response from Digio SDk ');
  };

  onCancel = () => {
    console.log('Cancel Response from Digio SDk ');
  };

  componentDidMount = () => {};

  render() {
    return (
      <DigioRNComponent
        onSuccess={this.onSuccess}
        onCancel={this.onCancel}
        options={this.state.options}
        digioDocumentId={this.state.digioDocumentId}
        identifier={this.state.digioUserIdentifier}
        digioToken={this.state.digioLoginToken}
      />
    );
  }
}
