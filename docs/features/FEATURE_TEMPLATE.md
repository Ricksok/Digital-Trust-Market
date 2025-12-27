# Feature Template

## Feature: [Feature Name]

### Overview
- **Goal**: [What this feature achieves]
- **Scope**: [What's included/excluded]
- **User Personas**: [Who uses this feature]
- **Success Criteria**: [How we measure success]

---

## User Stories

### Epic 1: [Epic Name]

#### Story 1.1: [Story Title]
**As a** [user type]  
**I want to** [action]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Edge Cases:**
- Edge case 1
- Edge case 2

---

## Technical Requirements

### Database Schema

#### New Models
```prisma
model NewModel {
  // Fields
}
```

#### Modified Models
- `ModelName`: Added field `fieldName`

### API Endpoints

#### `POST /api/resource`
- **Description**: [What it does]
- **Auth**: [Required permissions]
- **Request Body**: [Schema]
- **Response**: [Schema]
- **Errors**: [Error codes]

### Service Layer

#### `serviceName.method()`
- **Purpose**: [What it does]
- **Parameters**: [Input]
- **Returns**: [Output]
- **Throws**: [Exceptions]

### Integration Points

#### Engine: [Engine Name]
- **Integration Type**: [How it integrates]
- **Data Flow**: [What data flows]
- **Triggers**: [When it's called]

---

## Frontend Requirements

### Pages/Components

#### Page: `/path/to/page`
- **Purpose**: [What it does]
- **Components**: [List of components]
- **User Flow**: [Step-by-step flow]

### UI/UX Considerations
- [Consideration 1]
- [Consideration 2]

---

## Testing Requirements

### Unit Tests
- [ ] Service method tests
- [ ] Controller tests
- [ ] Utility function tests

### Integration Tests
- [ ] API endpoint tests
- [ ] Database integration tests
- [ ] Engine integration tests

### E2E Tests
- [ ] Complete user flow test
- [ ] Error handling test

### Performance Tests
- [ ] Load test requirements
- [ ] Response time targets

---

## Implementation Steps

1. **Step 1**: [Description]
   - Dependencies: [List]
   - Risk: [Risk level]

2. **Step 2**: [Description]
   - Dependencies: [List]
   - Risk: [Risk level]

---

## Definition of Done

- [ ] All user stories implemented
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA approved
- [ ] Product owner sign-off

---

## Dependencies

**Blocks**: [Features that depend on this]
**Blocked By**: [Features this depends on]

---

## Notes

[Additional notes, considerations, or decisions]

