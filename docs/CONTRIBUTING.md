# Contributing to Medication Reminder

Thank you for your interest in contributing to the Medication Reminder project! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

### 🐛 Bug Reports

- Use the [GitHub Issues](https://github.com/mohamed-samir-dev/meds-notifier/issues) page
- Search existing issues before creating new ones
- Provide detailed reproduction steps
- Include browser/device information

### ✨ Feature Requests

- Discuss new features in [GitHub Discussions](https://github.com/mohamed-samir-dev/meds-notifier/discussions)
- Explain the use case and benefits
- Consider implementation complexity

### 🔧 Code Contributions

- Fork the repository
- Create feature branches
- Follow coding standards
- Write clear commit messages
- Submit pull requests

## 🚀 Development Setup

### Prerequisites

- Modern web browser (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- Local web server (Python, Node.js, or PHP)
- Git for version control

### Local Development

```bash
# Clone your fork
git clone git@github.com:mohamed-samir-dev/meds-notifier.git
cd meds-notifier

# Start local server
python -m http.server 8000
# OR
npx serve .
# OR
php -S localhost:8000

# Open http://localhost:8000
```

## 📝 Coding Standards

### JavaScript

- Use ES6+ features and modern syntax
- Follow camelCase naming convention
- Add JSDoc comments for functions
- Handle errors gracefully
- Use const/let instead of var

```javascript
/**
 * Add a new medication to the list
 * @param {Object} medication - Medication object
 * @param {string} medication.name - Medication name
 * @param {string} medication.dosage - Medication dosage
 * @throws {Error} If the medication object is invalid or missing required fields
 */
function addMedication(medication) {
  // Validate medication object
  if (!medication || !medication.name || !medication.dosage) {
    throw new Error("Invalid medication object: name and dosage are required");
  }

  // Assuming we have a list to add to
  const medicationsList = [];
  try {
    medicationsList.push(medication);
    console.log("Medication added successfully:", medication);
  } catch (error) {
    console.error("Error adding medication:", error);
  }
}
```

### CSS

- Use BEM methodology for class naming
- Mobile-first responsive design
- Use CSS custom properties (variables)
- Follow consistent indentation (2 spaces)

```css
/* Block */
.medication-card {
  display: flex;
  flex-direction: column;
  padding: var(--card-padding, 16px);
  background-color: var(--card-background, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Element */
.medication-card__header {
  font-size: var(--header-font-size, 18px);
  font-weight: bold;
  margin-bottom: 8px;
}

/* Modifier */
.medication-card--expired {
  background-color: var(--expired-background, #f8d7da);
  border: 1px solid var(--expired-border, #f5c6cb);
}

/* Mobile-first approach: Basic styles */
@media (max-width: 600px) {
  .medication-card {
    padding: var(--card-padding-mobile, 12px);
  }
}

/* Larger screen styles */
@media (min-width: 601px) {
  .medication-card {
    padding: var(--card-padding-desktop, 20px);
  }
}
```

### HTML

- Use semantic HTML5 elements
- Include proper ARIA attributes
- Ensure accessibility compliance
- Validate markup

## 🌍 Internationalization

### Adding Translations

- Update both Arabic and English translations
- Maintain consistent terminology
- Test RTL/LTR layouts
- Consider cultural adaptations

```javascript
translations: {
    ar: {
        newKey: 'النص العربي'
    },
    en: {
        newKey: 'English text'
    }
}
```

## 🧪 Testing

### Manual Testing

- Test on multiple browsers
- Verify mobile responsiveness
- Check PWA functionality
- Test notification permissions
- Validate form inputs

### Testing Checklist

- [ ] All features work in both languages
- [ ] Responsive design on mobile/tablet/desktop
- [ ] PWA installation and offline functionality
- [ ] Notifications work correctly
- [ ] Data export/import functions
- [ ] Calendar integration works

## 📋 Pull Request Process

### Before Submitting

1. Test your changes thoroughly
2. Update documentation if needed
3. Follow commit message conventions
4. Ensure code follows style guidelines

### Commit Message Format

```
type(scope): description

feat(dashboard): add medication statistics chart
fix(notifications): resolve timing issue
docs(readme): update installation instructions
style(css): improve mobile responsiveness
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Style/UI improvement

## Testing

- [ ] Tested on Chrome/Firefox/Safari
- [ ] Mobile responsive
- [ ] Both languages work
- [ ] PWA functionality intact

## Screenshots

Include screenshots for UI changes
```

## 🎨 Design Guidelines

### UI/UX Principles

- **Simplicity**: Keep interface clean and intuitive
- **Accessibility**: Ensure usability for all users
- **Consistency**: Maintain design patterns
- **Performance**: Optimize for speed and efficiency

### Color Palette

- Primary: `#667eea` (Blue)
- Success: `#48bb78` (Green)
- Warning: `#ed8936` (Orange)
- Error: `#f56565` (Red)
- Text: `#2d3748` (Dark Gray)

### Typography

- Headers: System fonts with fallbacks
- Body: Readable font sizes (16px minimum)
- Line height: 1.5 for better readability

## 🔒 Security Guidelines

### Data Handling

- Use localStorage responsibly
- Validate all user inputs
- Sanitize data before display
- Handle sensitive information carefully

### Best Practices

- No hardcoded credentials
- Secure API communications
- Proper error handling
- Input validation and sanitization

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Reviews**: Code-specific discussions

### Response Times

- Issues: Within 48 hours
- Pull Requests: Within 72 hours
- Discussions: Within 24 hours

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

---

**Thank you for helping make Medication Reminder better for everyone! 🎉**
