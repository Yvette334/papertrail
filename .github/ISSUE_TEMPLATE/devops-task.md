name: DevOps Task
description: Create a task for CI/CD, infrastructure, or setup
title: "[Task]: "
labels: ["devops"]
body:
  - type: textarea
    id: description
    attributes:
      label: Task Description
      description: Describe the task requirements.
    validations:
      required: true