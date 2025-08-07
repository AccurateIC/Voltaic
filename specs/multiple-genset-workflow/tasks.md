# Implementation Plan

- [ ] 1. Create Genset database model and migration
  - Create database migration for gensets table with identifier, name, location, specifications, and is_active fields
  - Implement Genset model with proper relationships, validation, and UUID generation
  - Add GensetSpecifications interface with powerRating, fuelType, manufacturer, model, phases, voltage, frequency
  - Create database seeder to populate initial genset data for development and testing
  - Write unit tests for Genset model validation, relationships, and database operations
  - _Requirements: 1.1, 4.1, 4.2, 4.3, 7.1_

- [ ] 2. Update existing table schemas with genset foreign keys
  - Create migration to add genset_id NOT NULL foreign key column to archives table
  - Create migration to add genset_id NOT NULL foreign key column to notifications table
  - Create migration to add genset_id NOT NULL foreign key column to maintenance_notifications table
  - Create migration to add genset_id NOT NULL foreign key column to genset_properties table
  - Create migration to add default_genset_id foreign key column to users table
  - Migrate existing data to assign default genset associations
  - Add proper foreign key constraints and indexes for performance
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3. Create GensetService with CRUD operations
  - Implement GensetService class with create, read, update, delete operations using Result<T, E> pattern
  - Add methods for findByIdentifier, getAll, getActive, getForUser with proper error handling
  - Implement genset activation/deactivation functionality with status management
  - Add getStatus method to retrieve real-time genset status with heartbeat and metrics
  - Write comprehensive unit tests for all GensetService methods including error scenarios
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.4_

- [ ] 4. Create GensetController and API endpoints
  - Implement GensetController with RESTful endpoints for genset CRUD operations
  - Add validation using AdonisJS validators for genset creation and updates
  - Implement proper error handling for duplicate identifiers, not found, and validation errors
  - Add API endpoints: GET /gensets, POST /gensets, PUT /gensets/:id, DELETE /gensets/:id, GET /gensets/:id/status
  - Add routes to start.ts file with appropriate middleware for authentication and authorization
  - Write integration tests for all genset API endpoints with proper error handling validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.4_

- [ ] 5. Update Archive service and controller for genset filtering
  - Modify ArchiveService methods to accept genset ID parameter and filter all queries by genset
  - Update getPaginatedByGenset, getPropertyStatistics, getAnomalyStatistics methods for genset-specific data
  - Add getLatestByGenset and getRealtimeData methods with genset filtering
  - Update Archive controller to require genset context and validate genset access permissions
  - Modify archive API endpoints to include genset ID in request parameters
  - Write tests to verify complete genset-specific data isolation in archive operations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 7.2_

- [ ] 6. Update Notification services for genset-specific filtering
  - Modify notification creation logic to automatically include genset ID from archive data
  - Update notification queries to filter by genset ID and ensure data isolation
  - Modify PDM notification creation to include genset association from maintenance data
  - Update notification API endpoints to filter by selected genset
  - Write tests for genset-specific notification creation, filtering, and data isolation
  - _Requirements: 3.2, 6.5, 6.6, 7.1, 7.2_

- [ ] 7. Update real-time data streaming for genset-specific channels
  - Modify transmit channels to include genset-specific identifiers in channel names
  - Update archive data creation endpoint to broadcast genset-specific events
  - Modify notification broadcasting to use genset-specific channels
  - Update PDM data streaming to include genset context and route to correct channels
  - Implement proper channel subscription/unsubscription when genset selection changes
  - Write tests for genset-specific real-time event broadcasting and channel routing
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

- [ ] 8. Install and configure Motion library (motion.dev)
  - Install motion package from https://motion.dev and configure for TypeScript support
  - Create motion configuration file with performance optimizations and spring presets
  - Set up motion provider at app root level with reduced motion preference detection
  - Configure webpack/vite optimizations for motion library bundle size and performance
  - Test animation performance across different devices and browsers to ensure 60fps
  - _Requirements: 1.3, 1.4, 1.5, 5.1, 5.4_

- [ ] 9. Create GensetContext and provider system
  - Implement GensetContext using React Context API for global genset state management
  - Create GensetProvider component with selectedGenset state, availableGensets, and gensetStatuses
  - Add localStorage persistence for selected genset with automatic restoration on app load
  - Implement genset selection logic with smooth transitions and loading states
  - Add automatic genset status polling and real-time updates
  - Write comprehensive unit tests for GensetContext state management and persistence
  - _Requirements: 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Create fullscreen GensetSelectionScreen component
  - Design and implement fullscreen GensetSelectionScreen with Motion library animations
  - Create GensetCard component with hover effects, status indicators, and metric previews using motion components
  - Implement staggered entrance animations for genset cards with motion.div and configurable delays
  - Add GensetPreview component showing real-time key metrics for each genset with smooth transitions
  - Include GensetSearch component with filtering and search functionality
  - Style components with futuristic design using TailwindCSS and DaisyUI
  - Ensure responsive design works perfectly on mobile and tablet devices
  - Write component tests for GensetSelectionScreen interactions and Motion animations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.5_

- [ ] 11. Create GensetSwitcher navigation component
  - Design and implement GensetSwitcher component for main navigation with Motion dropdown animations
  - Add GensetIndicator to show current selected genset with status and location
  - Implement smooth dropdown animations with motion.div for genset selection
  - Add visual feedback for genset switching with Motion loading states and transitions
  - Include GensetStatus component showing online/offline indicators with motion effects
  - Ensure component integrates seamlessly with existing navigation structure
  - Write component tests for GensetSwitcher behavior and user interactions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.4_

- [ ] 12. Update all data hooks for genset-aware fetching
  - Modify useArchiveData hook to include genset ID in query keys and automatically filter by selected genset
  - Update useNotificationData hook to fetch genset-specific notifications with proper filtering
  - Modify usePDMData hook for genset-specific maintenance data and predictions
  - Update useRealtimeData hook to subscribe to genset-specific channels
  - Add automatic refetching when genset selection changes with smooth loading transitions
  - Implement proper error handling for genset-specific data fetching failures
  - Write tests for genset-aware data fetching behavior and automatic refetching
  - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2_

- [ ] 13. Update real-time subscriptions for genset-specific channels
  - Modify useMessageBus hook to support genset-specific channel subscriptions
  - Update archive real-time updates to automatically filter by selected genset
  - Modify notification real-time subscriptions for genset-specific events
  - Implement automatic channel switching when genset selection changes
  - Add proper cleanup and unsubscription logic to prevent memory leaks
  - Write tests for genset-specific real-time data subscriptions and channel management
  - _Requirements: 2.2, 2.3, 6.1, 6.2, 6.3, 6.5_

- [ ] 14. Integrate GensetSelectionScreen into app routing
  - Add GensetSelectionScreen route and integrate with existing routing structure
  - Implement route guard to redirect to selection screen when no genset is selected
  - Create smooth page transitions between selection screen and dashboard pages using Motion
  - Add proper loading states and error handling for genset selection routing
  - Ensure URL state management works correctly with genset selection
  - Write integration tests for genset selection routing and navigation flow
  - _Requirements: 1.1, 1.2, 2.4, 2.5_

- [ ] 15. Update all dashboard pages to use genset context
  - Modify Archive page to use selected genset for all data filtering and display
  - Update Anomalies page to display genset-specific anomaly data with proper filtering
  - Modify Engine, Generator, and Mains pages to show selected genset data only
  - Update RUL and Maintenance pages for genset-specific predictions and maintenance data
  - Add genset selection prompts and redirection when no genset is selected
  - Implement smooth data transition animations when switching between gensets using Motion
  - Write integration tests for genset-aware page behavior and data isolation
  - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 16. Implement comprehensive error handling and user feedback
  - Create error boundaries for genset-related failures in React components
  - Add user-friendly error messages for genset not found, access denied, and connection issues
  - Implement retry mechanisms for failed genset data operations with progressive backoff
  - Add animated loading indicators and skeleton screens for genset data fetching using Motion
  - Create fallback UI states when genset data is unavailable or loading fails
  - Implement toast notifications for genset selection, switching, and error states
  - Write tests for error handling scenarios, user feedback, and recovery mechanisms
  - _Requirements: 1.1, 2.4, 5.1, 5.2, 5.3, 6.4_

- [ ] 17. Implement performance optimizations and monitoring
  - Add code splitting for genset selection components to reduce initial bundle size
  - Implement React.memo for expensive genset card renders and Motion animations
  - Add virtual scrolling for large genset lists to maintain smooth performance
  - Optimize Motion animation performance with hardware acceleration and 60fps targeting
  - Implement proper cleanup for Motion components and event listeners
  - Add performance monitoring for animation frame rates and memory usage
  - Write performance tests to validate 60fps animations and smooth transitions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 18. Create end-to-end tests for complete genset workflow
  - Write E2E tests for genset selection screen interactions and Motion animations
  - Test complete genset switching workflow from selection to dashboard data updates
  - Verify data isolation across different gensets with real-time updates
  - Test notification handling and real-time streaming for multiple gensets
  - Validate responsive design and mobile interactions for genset selection
  - Test error scenarios including network failures, invalid gensets, and recovery
  - Verify performance requirements including animation smoothness and load times
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 19. Run comprehensive testing and quality assurance
  - Execute all unit tests for backend genset services and models
  - Run integration tests for genset API endpoints and data filtering
  - Execute frontend component tests for genset selection and switching
  - Run performance tests to validate Motion animation smoothness and load times
  - Execute E2E tests for complete genset workflow scenarios
  - Run accessibility tests for keyboard navigation and screen reader support
  - Execute security tests for genset access control and data isolation
  - Run cross-browser compatibility tests for genset selection interface
  - _Requirements: All requirements validation_

- [ ] 20. Deploy and monitor genset workflow system
  - Deploy backend changes with genset database migrations and API endpoints
  - Deploy frontend changes with genset selection interface and Motion animations
  - Monitor system performance and animation smoothness in production
  - Set up monitoring for genset data streaming and real-time updates
  - Monitor error rates and user feedback for genset selection and switching
  - Create production runbook for genset system maintenance and troubleshooting
  - _Requirements: Production readiness and monitoring_