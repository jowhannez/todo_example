class Todo {
    constructor() {
        if (localStorage.getItem('tasks')) {
            this.tasks = JSON.parse(localStorage.getItem('tasks'));
            this.renderTasks();

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

    addTask(formData) {
        const task = {
            id         : this.previousId + 1,
            title      : formData.get('title'),
            description: formData.get('description'),
            dueDate    : formData.get('dueDate')
        };

        this.tasks[formData.get('priority')].push(task);
        this.previousId = task.id;
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const lists = document.querySelectorAll('[data-list]');
        for (const list of lists) {
            const priority = list.dataset.list;
            list.innerHTML = '';

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

                const checkmark = document.createElement('div');
                checkmark.classList.add('todo__task-checkmark');
                taskElement.appendChild(checkmark);

                taskElement.addEventListener('click', event => {
                    if (event.target === checkmark) {
                        this.tasks[priority] = this.tasks[priority].filter(
                            t => t.id !== task.id
                        );
                        localStorage.setItem('tasks', JSON.stringify(this.tasks));
                        this.renderTasks();
                        
                        return;
                    }
                    this.openTask(task);
                });
                list.appendChild(taskElement);
            }
        }
    }

    openTask(task) {
        const modal = document.querySelector('.modal');

        const content = document.createElement('div');
        content.classList.add('modal__content');
        content.innerHTML = `
            <h2 class="modal__title">${task.title}</h2>
            <p>${task.description}</p>
            <p>Due: ${task.dueDate}</p>
        `;

        const close = document.createElement('button');
        close.classList.add('modal__close');
        close.innerHTML = 'x';
        close.addEventListener('click', () => {
            modal.innerHTML = '';
            modal.classList.remove('modal--open');
        });
        content.appendChild(close);
        modal.appendChild(content);
        modal.classList.add('modal--open');

        modal.addEventListener('click', event => {
            if (event.target === modal) {
                modal.innerHTML = '';
                modal.classList.remove('modal--open');
            }
        });
    }
}

const todo = new Todo();
const form = document.querySelector('form');
form.addEventListener('submit', event => {
    event.preventDefault();
    todo.addTask(new FormData(event.target));
    todo.renderTasks();
});