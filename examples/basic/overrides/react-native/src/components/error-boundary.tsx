import React from 'react';
import { Text } from 'react-native';

// Still has to be a class component :(
// https://reactjs.org/docs/error-boundaries.html#introducing-error-boundaries
export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error rendering', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text style={{ color: 'gray' }}>Error rendering block</Text>;
    }

    return this.props.children;
  }
}
