# React Form Control

A lightweight React component library for building accessible and customizable form controls.

## Features

- **Easy to Use**: Simple API for form inputs, validation, and submission
- **Accessible**: WCAG compliant components with proper ARIA attributes
- **Customizable**: Flexible styling and configuration options
- **Validation**: Built-in form validation with custom rules
- **Controlled & Uncontrolled**: Support for both component patterns

## Installation

```bash
npm install react-form-control
```

## Quick Start

```jsx
import { Form, Input, Button } from "react-form-control";

export default function MyForm() {
  return (
    <Form onSubmit={(data) => console.log(data)}>
      <Input name="email" type="email" required />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## Components

- **Form**: Container for form elements and submission handling
- **Input**: Text, email, password, and number inputs
- **Select**: Dropdown selection component
- **Checkbox**: Individual and group checkboxes
- **Radio**: Radio button groups
- **Textarea**: Multi-line text input

## Documentation

See [docs](./docs) for detailed API reference and examples.

## License

MIT
