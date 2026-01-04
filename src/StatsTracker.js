export class StatsTracker {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.reset();
    this.setupListeners();
  }

  reset() {
    this.startTime = Date.now();
    this.endTime = null;
    
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    
    this.resourcesCollected = {
      metal: 0,
      energy: 0
    };
    
    this.ammoUsed = {
      kinetic: 0,
      flux: 0
    };
    
    this.wavesCompleted = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
  }

  setupListeners() {
    this.eventBus.on('weapon:fired', (data) => {
      this.shotsFired++;
      if (data.type) {
        this.ammoUsed[data.type] = (this.ammoUsed[data.type] || 0) + 1;
      }
    });

    this.eventBus.on('enemy:hit', (data) => {
      this.shotsHit++;
      if (data.damage) {
        this.damageDealt += data.damage;
      }
    });

    this.eventBus.on('enemy:killed', () => {
      this.kills++;
    });

    this.eventBus.on('resource:collected', (data) => {
      if (data.type === 'metal' || data.type === 'energy') {
        this.resourcesCollected[data.type] += data.amount;
      }
    });

    this.eventBus.on('wave:cleared', (data) => {
      this.wavesCompleted = data.wave;
    });

    this.eventBus.on('player:damaged', (data) => {
      if (data.amount) {
        this.damageTaken += data.amount;
      }
    });

    this.eventBus.on('game:victory', () => {
      this.endTime = Date.now();
    });

    this.eventBus.on('game:defeat', () => {
      this.endTime = Date.now();
    });
  }

  getAccuracy() {
    if (this.shotsFired === 0) return 0;
    return Math.round((this.shotsHit / this.shotsFired) * 100);
  }

  getFavoriteAmmo() {
    const total = this.ammoUsed.kinetic + this.ammoUsed.flux;
    if (total === 0) return { type: 'kinetic', percentage: 0 };
    
    if (this.ammoUsed.kinetic > this.ammoUsed.flux) {
      return {
        type: 'Kinetic',
        percentage: Math.round((this.ammoUsed.kinetic / total) * 100)
      };
    } else {
      return {
        type: 'Flux',
        percentage: Math.round((this.ammoUsed.flux / total) * 100)
      };
    }
  }

  getPlayTime() {
    const endTime = this.endTime || Date.now();
    const totalSeconds = Math.floor((endTime - this.startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  getStats() {
    return {
      kills: this.kills,
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      accuracy: this.getAccuracy(),
      resourcesCollected: { ...this.resourcesCollected },
      ammoUsed: { ...this.ammoUsed },
      favoriteAmmo: this.getFavoriteAmmo(),
      wavesCompleted: this.wavesCompleted,
      playTime: this.getPlayTime(),
      damageDealt: this.damageDealt,
      damageTaken: this.damageTaken
    };
  }
}
