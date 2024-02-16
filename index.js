class Todo {
    constructor() {
        // check if the tasks exist in localstorage
        if (localStorage.getItem('tasks')) {
            this.tasks = JSON.parse(localStorage.getItem('tasks'));
            this.renderTasks();

            // set the previousId to the highest id in the tasks
            this.previousId = Math.max(
                ...Object.values(this.tasks).map(
                    tasks => Math.max(...tasks.map(t => t.id))
                )
            );
        } else {
            this.tasks = {
                low   : [],
                medium: [],
                high  : []
            };
            this.previousId = 0;
        }
    }


    /**
     * Adds tasks from the form data to the tasks list
     * 
     * @param {FormData} formData
     */
    addTask(formData) {
        const task = {
            id         : this.previousId + 1,
            title      : formData.get('title'),
            description: formData.get('description'),
            dueDate    : formData.get('dueDate')
        };

        // Add the task to the correct priority list
        this.tasks[formData.get('priority')].push(task);

        // Set the previousId to the current task id
        this.previousId = task.id;

        // Save the tasks to localstorage
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }


    /**
     * Renders the tasks from this.tasks to the DOM
     */
    renderTasks() {
        const lists = document.querySelectorAll('[data-list]');
        for (const list of lists) {
            // get the priority from the value we set in the data-list="value"
            const priority = list.dataset.list;

            // remove any already rendered tasks
            list.innerHTML = '';

            // render all of the tasks for the different priorities
            const tasks = this.tasks[priority];
            for (const task of tasks) {
                const taskElement = document.createElement('div');
                taskElement.classList.add(
                    'todo__task',
                    'todo__task--' + priority
                );
                taskElement.innerHTML = `
                    <h2 class="todo__task-title">${task.title}</h2>
                    <div class="todo__task-due">${task.dueDate}</div>
                `;

                // Add checkmark element 
                const checkmark = document.createElement('div');
                checkmark.classList.add('todo__task-checkmark');
                taskElement.appendChild(checkmark);

                taskElement.addEventListener('click', event => {
                    // If we click on the checkmark, remove the task
                    if (event.target === checkmark) {
                        this.tasks[priority] = this.tasks[priority].filter(
                            t => t.id !== task.id
                        );
                        this.renderTasks();
                        
                        return;
                    }

                    // Else we open the task
                    this.openTask(task);
                });
                list.appendChild(taskElement);
            }
        }
    }


    /**
     * Opens a modal with the task details
     * 
     * @param {Object} task 
     */
    openTask(task) {
        const modal = document.querySelector('.modal');

        // Make the modal content element
        const content = document.createElement('div');
        content.classList.add('modal__content');
        content.innerHTML = `
            <h2 class="modal__title">${task.title}</h2>
            <p>${task.description}</p>
            <p>Due: ${task.dueDate}</p>
        `;

        // Make the close button
        const close = document.createElement('button');
        close.classList.add('modal__close');
        close.innerHTML = 'x';
        close.addEventListener('click', () => {
            modal.innerHTML = '';
            modal.classList.remove('modal--open');
        });
        content.appendChild(close);

        // Add the content to the modal and open it
        modal.appendChild(content);
        modal.classList.add('modal--open');

        // Also close if you click outside the modal__content div
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                modal.innerHTML = '';
                modal.classList.remove('modal--open');
            }
        });
    }
}

const todo = new Todo();

// When we hit the "create" button, we add the task to the list then render it
const form = document.querySelector('form');
form.addEventListener('submit', event => {
    event.preventDefault();
    todo.addTask(new FormData(event.target));
    todo.renderTasks();
});