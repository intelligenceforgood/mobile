/* eslint-disable import/first */
jest.mock('../../../src/config', () => ({
  config: {
    authProvider: 'mock',
    apiBaseUrl: 'http://localhost:8000',
    profile: 'local',
    apiMode: 'direct',
  },
}));

jest.mock('../../../src/auth', () => ({
  auth: {
    kind: 'mock',
    initialize: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: jest.fn().mockResolvedValue(null),
    getUser: jest.fn().mockResolvedValue(null),
    onChange: jest.fn(() => () => {}),
  },
}));

jest.mock('../../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EvidenceGrid } from '../../../src/features/evidence/components/EvidenceGrid';
import type { EvidenceDocument } from '../../../src/features/evidence/types';

function makeDoc(overrides: Partial<EvidenceDocument> = {}): EvidenceDocument {
  return {
    documentId: 'doc-001',
    title: 'Test Document',
    sourceUrl: null,
    mimeType: null,
    fileSha256: null,
    ingestedAt: null,
    textSha256: null,
    available: false,
    ...overrides,
  };
}

describe('EvidenceGrid', () => {
  const noop = jest.fn();

  it('renders the correct number of tiles', () => {
    const docs = [makeDoc({ documentId: 'a' }), makeDoc({ documentId: 'b' }), makeDoc({ documentId: 'c' })];
    render(<EvidenceGrid caseId="case-1" documents={docs} onPress={noop} />);
    expect(screen.getByTestId('evidence-tile-a')).toBeTruthy();
    expect(screen.getByTestId('evidence-tile-b')).toBeTruthy();
    expect(screen.getByTestId('evidence-tile-c')).toBeTruthy();
  });

  it('calls onPress with the correct document when tapped', () => {
    const doc = makeDoc({ documentId: 'x' });
    const onPress = jest.fn();
    render(<EvidenceGrid caseId="case-1" documents={[doc]} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('evidence-tile-x'));
    expect(onPress).toHaveBeenCalledWith(doc);
  });

  it('shows empty state when documents array is empty', () => {
    render(<EvidenceGrid caseId="case-1" documents={[]} onPress={noop} />);
    expect(screen.getByText('No evidence documents.')).toBeTruthy();
  });

  it('does not show the grid testID when empty', () => {
    render(<EvidenceGrid caseId="case-1" documents={[]} onPress={noop} />);
    expect(screen.queryByTestId('evidence-grid')).toBeNull();
  });

  it('shows evidence-grid testID when documents exist', () => {
    const docs = [makeDoc()];
    render(<EvidenceGrid caseId="case-1" documents={docs} onPress={noop} />);
    expect(screen.getByTestId('evidence-grid')).toBeTruthy();
  });
});
