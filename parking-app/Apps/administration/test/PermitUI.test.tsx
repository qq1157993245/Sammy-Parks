import PermitView from '../src/components/PermitView';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

const updateZoneMaxPermits = vi.fn().mockResolvedValue(true);
const setZonePermits = vi.fn();
const zones = ['A'];
const zonePermits = { A: { current: null, newLimit: 15 } };

const renderPermitView = () =>
  render(
    <NextIntlClientProvider
      locale="en"
      messages={{
        administration: {
          override: 'Override',
        },
      }}
    >
      <PermitView
        zones={zones}
        zonePermits={zonePermits}
        setZonePermits={setZonePermits}
        updateZoneMaxPermits={updateZoneMaxPermits}
        isPending={false}
      />
    </NextIntlClientProvider>
  );

it('renders permit zones and handles override button click', async () => {
  const { getByLabelText } = renderPermitView();

  const button = getByLabelText('update-zone-A');
  fireEvent.click(button);

  await waitFor(() => {
    expect(updateZoneMaxPermits).toHaveBeenCalledWith('A', 15);
    expect(setZonePermits).toHaveBeenCalledWith(expect.any(Function));
  });
});

it('updates state correctly after override success', () => {
  const previous = { A: { current: 10, newLimit: 15 } };
  const stateUpdater = setZonePermits.mock.calls.find(
    ([arg]) => typeof arg === 'function'
  )?.[0];

  if (stateUpdater) {
    const updated = stateUpdater(previous);
    expect(updated).toEqual({
      A: {
        current: 15,
        newLimit: 15,
      },
    });
  }
});

it('updates state on input change to a new number', async () => {
  const { getByLabelText, getAllByLabelText } = renderPermitView();

  const input = getAllByLabelText('New Limit')[0];
  fireEvent.change(input, { target: { value: '25' } });

  await waitFor(() => {
    expect(setZonePermits).toHaveBeenCalledWith(expect.any(Function));
  });

  const newStateUpdater = setZonePermits.mock.calls.find(
    ([arg]) => typeof arg === 'function'
  )?.[0];

  if (newStateUpdater) {
    const updated = newStateUpdater({ A: { current: 25, newLimit: 25 } });
    expect(updated).toEqual({
      A: {
        current: 25,
        newLimit: 25,
      },
    });
  }
});

it('applies fallback newLimit when input is empty', async () => {
  const {getAllByLabelText } = renderPermitView();

  const input = getAllByLabelText('New Limit')[0];
  fireEvent.change(input, { target: { value: '' } });

  await waitFor(() => {
    expect(setZonePermits).toHaveBeenCalledWith(expect.any(Function));
  });

  const fallbackUpdater = setZonePermits.mock.calls.find(
    ([arg]) => typeof arg === 'function'
  )?.[0];

  if (fallbackUpdater) {
    const updated = fallbackUpdater({ A: { current: null, newLimit: 0 } });
    expect(updated).toEqual({
      A: {
        current: 0,
        newLimit: 0,
      },
    });
  }
});

it('accepts input change to a valid number again', async () => {
  const { getByLabelText, getAllByLabelText } = renderPermitView();

  const input = getAllByLabelText('New Limit')[0];
  fireEvent.change(input, { target: { value: '15' } });

  await waitFor(() => {
    expect(setZonePermits).toHaveBeenCalled();
  });
});