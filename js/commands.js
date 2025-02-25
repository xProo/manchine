class VoiceCommandManager {
  constructor() {
    this.commands = {
      ouvre: {
        contacts: () => this.navigateTo("contacts"),
        accueil: () => this.navigateTo("home"),
        paramètres: () => this.navigateTo("settings"),
      },
      active: {
        "mode sombre": () => this.toggleDarkMode(),
        son: () => this.toggleSound(),
      },
    };
  }

  processCommand(transcript) {
    const words = transcript.toLowerCase().split(" ");

    for (let i = 0; i < words.length; i++) {
      const action = this.commands[words[i]];
      if (action && words[i + 1]) {
        const target = words[i + 1];
        if (action[target]) {
          action[target]();
          return true;
        }
      }
    }
    return false;
  }

  navigateTo(pageId) {
    // Cacher toutes les pages
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active");
    });

    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add("page-transition");
      targetPage.classList.add("active");

      // Notification visuelle
      this.showNotification(`Navigation vers ${pageId}`);
    }
  }

  showNotification(message) {
    // Créer une notification
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    // Supprimer après animation
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
  }

  toggleSound() {
    // Implémenter le contrôle du son
    console.log("Basculement du son");
  }
}
