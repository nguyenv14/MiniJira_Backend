export enum TaskStatus {
  TODO = 1,
  IN_PROGRESS = 2,
  REVIEW = 3,
  DONE = 4
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

// utils/project.enums.ts

// Project Type
export enum ProjectType {
  INTERNAL = 1,
  EXTERNAL = 2,
  LABOR = 3,
  PRODUCT = 4
}

// Categories
export enum ProjectCategory {
  WEB_DEVELOPMENT = 1,
  MOBILE_DEVELOPMENT = 2,
  DESIGN = 3,
  MARKETING = 4,
  CONSULTING = 5
}

// Industries
export enum Industry {
  TECHNOLOGY = 1,
  FINANCE = 2,
  HEALTHCARE = 3,
  EDUCATION = 4,
  ECOMMERCE = 5,
}

// ROle in projects
export enum RoleInProject {
  ADMIN = 1, // Can change status all and create update delete task
  LEADER = 2, // Can change status and review -> done and create update task
  MEMBER = 3 // can change status todo -> inprogress -> review
}

export enum BoardColor {
  WHITE = 0,
  BLUE = 1,
  RED = 2,
  GREEN = 3,
  YELLOW = 4,
  PURPLE = 5,
  ORANGE = 6,
  GRAY = 7,
  NAVY = 8,
}