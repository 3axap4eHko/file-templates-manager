import React, { Component } from 'react';

export default function with{{=$.NAME}}(options) {

  return WrappedComponent => {

    const componentName = WrappedComponent.displayName || WrappedComponent.name;

    return class {{=$.NAME}} extends Component {

      static displayName = `{{=$.NAME}}(${componentName})`;
      static WrappedComponent = WrappedComponent;

      render() {
        return <WrappedComponent {...this.props} />;
      }
    };
  };
}
