import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { tokens } from '@/design/tokens';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  /** Label shown in the inline error for context (e.g. "Summary", "Timeline"). */
  section: string;
  children: React.ReactNode;
}

/**
 * Per-section error boundary for the Case Detail screen.
 * A render error in one section shows a compact inline fallback without
 * crashing adjacent sections. The user can retry the errored section independently.
 */
export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Sprint 5: route to Sentry
    console.error(`[SectionErrorBoundary:${this.props.section}]`, error.message, info.componentStack?.slice(0, 200));
  }

  private retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container} testID={`section-error-${this.props.section}`}>
        <Text style={styles.title}>{this.props.section} failed to load</Text>
        <Text style={styles.message} numberOfLines={2}>
          {this.state.error?.message ?? 'Unknown error'}
        </Text>
        <TouchableOpacity onPress={this.retry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const { error: ec } = tokens.themes.default.color;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ec.border,
    backgroundColor: ec.background,
    padding: 12,
    marginVertical: 4,
  },
  title: {
    color: ec.text,
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 4,
  },
  message: {
    color: ec.textStrong,
    fontSize: 12,
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: ec.buttonBackground,
  },
  retryText: {
    color: ec.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
});
