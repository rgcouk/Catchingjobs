# Catchingjobs Domain Glossary

## Architecture
- **Route Loaders**: Functions that fetch data at the network boundary before a React component mounts, serving as the translation layer between API payloads and UI interfaces.
- **Use-Case Services**: Deep modules in the backend that encapsulate business logic (e.g., `ProcessApplication`), isolating it from the HTTP layer.
- **Domain Exceptions**: Custom errors thrown by the service layer (e.g., `ApplicationNotFoundError`) that are agnostic to the transport layer (HTTP, CLI, etc.).

## Components
- **Kanban Column / Task**: Strongly typed interfaces defining the UI requirements for rendering the Kanban board, strictly decoupled from the backend `Application` database model.
