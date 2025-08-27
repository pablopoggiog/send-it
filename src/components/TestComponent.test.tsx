import { describe, it, expect } from 'vitest';

import { render } from '@testing-library/react';

import { TestComponent } from './TestComponent';

describe('<TestComponent/>', () => {
  it('contains the expected text', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test')).toBeInTheDocument();
  });
});
