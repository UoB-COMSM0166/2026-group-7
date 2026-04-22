(function () {
    var TRACKS = [
        { name: 'Balloon Festival', src: 'pss/assets/audio/music/BalloonFestival.mp3' },
        { name: 'Main Theme',       src: 'pss/assets/audio/music/MainTheme.mp3' },
        { name: 'Level 1 & 2',      src: 'pss/assets/audio/music/Level12.mp3' },
        { name: 'Level 3 & 4',      src: 'pss/assets/audio/music/Level34.mp3' },
        { name: 'Level 5',          src: 'pss/assets/audio/music/Level5.mp3' },
        { name: 'Library',          src: 'pss/assets/audio/music/Library.mp3' },
        { name: 'Time Room',        src: 'pss/assets/audio/music/TimeRoom.mp3' },
        { name: 'Final Day',        src: 'pss/assets/audio/music/FinalDay.mp3' },
        { name: 'Life Ending',      src: 'pss/assets/audio/music/LifeEnding.mp3' },
        { name: 'Death Ending',     src: 'pss/assets/audio/music/DeathEnding.mp3' },
    ];

    var audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;

    var currentIdx = 0;

    function play(idx) {
        currentIdx = idx;
        audio.src = TRACKS[idx].src;
        audio.play().catch(function () {});
        updateUI();
        localStorage.setItem('pss_music_idx', idx);
        localStorage.setItem('pss_music_playing', '1');
    }

    function updateUI() {
        var nowEl = document.getElementById('musicNowName');
        if (nowEl) nowEl.textContent = TRACKS[currentIdx].name;

        var btn = document.getElementById('musicBtn');
        if (btn) {
            if (!audio.paused) btn.classList.add('playing');
            else btn.classList.remove('playing');
        }

        document.querySelectorAll('.music-tracks li').forEach(function (li, i) {
            li.classList.toggle('active', i === currentIdx);
        });
    }

    function togglePanel() {
        var panel = document.getElementById('musicPanel');
        if (panel) panel.classList.toggle('open');
    }

    function buildPlayer() {
        var ctrl = document.getElementById('musicCtrl');
        if (!ctrl) return;

        var btn = document.createElement('button');
        btn.className = 'nav-icon-btn music-btn';
        btn.id = 'musicBtn';
        btn.title = 'Music Player';
        btn.setAttribute('aria-label', 'Toggle music player');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePanel();
        });

        var panel = document.createElement('div');
        panel.className = 'music-panel';
        panel.id = 'musicPanel';

        var nowDiv = document.createElement('div');
        nowDiv.className = 'music-now';
        nowDiv.innerHTML = 'Now playing<span id="musicNowName">' + TRACKS[currentIdx].name + '</span>';

        var ul = document.createElement('ul');
        ul.className = 'music-tracks';
        TRACKS.forEach(function (t, i) {
            var li = document.createElement('li');
            li.textContent = t.name;
            li.addEventListener('click', function () {
                play(i);
            });
            ul.appendChild(li);
        });

        panel.appendChild(nowDiv);
        panel.appendChild(ul);
        ctrl.appendChild(btn);
        ctrl.appendChild(panel);

        document.addEventListener('click', function (e) {
            var panel = document.getElementById('musicPanel');
            var ctrl = document.getElementById('musicCtrl');
            if (panel && ctrl && !ctrl.contains(e.target)) {
                panel.classList.remove('open');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        buildPlayer();

        var savedIdx = parseInt(localStorage.getItem('pss_music_idx') || '0', 10);
        if (savedIdx >= 0 && savedIdx < TRACKS.length) currentIdx = savedIdx;

        audio.src = TRACKS[currentIdx].src;
        audio.play().catch(function () {});
        updateUI();

        audio.addEventListener('play', updateUI);
        audio.addEventListener('pause', updateUI);
    });
})();
