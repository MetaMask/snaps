import { DateTimePicker } from './DateTimePicker';

describe('DateTimePicker', () => {
  it('renders a date picker', () => {
    const element = <DateTimePicker name="test" type="date" />;

    expect(element).toStrictEqual({
      type: 'DateTimePicker',
      props: {
        name: 'test',
        type: 'date',
      },
      key: null,
    });
  });

  it('renders a time picker', () => {
    const element = <DateTimePicker name="test" type="time" />;

    expect(element).toStrictEqual({
      type: 'DateTimePicker',
      props: {
        name: 'test',
        type: 'time',
      },
      key: null,
    });
  });

  it('renders a date and time picker', () => {
    const element = <DateTimePicker name="test" type="datetime" />;

    expect(element).toStrictEqual({
      type: 'DateTimePicker',
      props: {
        name: 'test',
        type: 'datetime',
      },
      key: null,
    });
  });

  it('renders a date and time picker with optional props', () => {
    const element = (
      <DateTimePicker
        name="test"
        type="datetime"
        placeholder="Select date and time"
        disabled={true}
        value="2024-01-01T12:00Z"
      />
    );

    expect(element).toStrictEqual({
      type: 'DateTimePicker',
      props: {
        name: 'test',
        type: 'datetime',
        placeholder: 'Select date and time',
        disabled: true,
        value: '2024-01-01T12:00Z',
      },
      key: null,
    });
  });
});
