import { GithubUser } from './Githubuser.js';

export class Favorites {
  constructor(root) {
    this.root = document.getElementById(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || [];
  }
  save() {
    localStorage.setItem('@github-favorites', JSON.stringify(this.entries));
  }
  delete(user) {
    this.entries = this.entries.filter((entry) => entry.login !== user.login);
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector('.tb-body');
    this.update();
    this.onAdd();
  }

  async add(username) {
    try {
      const user = await GithubUser.search(username);

      const userExists = this.entries.find((entry) => entry.login === username);
      if (userExists) {
        throw new Error('Usuário já cadastrado!');
      }

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!');
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const input = this.root.querySelector('.search input');
      this.add(input.value);
      input.value = '';
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();
      row.classList.add('tb-row')
      row.querySelector('.user-info img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${user.name}`;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      row.querySelector('.user p').textContent = user.name;
      row.querySelector('.user span').textContent = user.login;
      row.querySelector('.repositories').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Deseja remover este favorito?');
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement('div');
    tr.innerHTML = `
            <div class="user">
              <div class="user-info">
                <img src="https://github.com/igorsantos-p.png" alt="" />
                <a href="https://github.com/igorsantos-p" target="_blank">
                  <p>Igor Pereira</p>
                  <span>igorsantos-p</span>
                </a>
              </div>
            </div>
            <span class="repositories">454</span>
            <span class="followers">5654</span>
            <button class="remove">Remover</button>
    `;
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('.tb-row').forEach((tr) => {
      tr.remove();
    });
  }
}
