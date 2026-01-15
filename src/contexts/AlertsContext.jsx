import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';

/**
 * AlertsContext
 *
 * Provider props:
 * - children
 * - game (optional)           : the game object (player, etc.)
 * - log (optional)            : function(msg, type) -> logger
 * - saveDebouncedWithLeaderboard (optional) : function(game) -> save
 * - stopAutoSave (optional)
 * - mainMenu / statMenu (optional) : objects with .isVisible, .show(), .hide(), .showStats() etc (optional)
 * - gameMenuKey (optional)    : key to use for cancelling alerts (default: 'Escape')
 */
const AlertsContext = createContext(null);

export function AlertsProvider({
  children,
  game: injectedGame = null,
  log = (...args) => console.log(...args),
  saveDebouncedWithLeaderboard = null,
  stopAutoSave = null,
  clear = () => localStorage.clear(),
  mainMenu = null,
  statMenu = null,
  settingsMenu = null,
  gameMenuKey = 'Escape'
}) {
  // Modal state
  const [visible, setVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState([]); // [{ text, onClick, className, disabled }]
  const [closable, setClosable] = useState(true);

  // For rebindAlert we might resolve a promise based on keypress
  const rebindResolveRef = useRef(null);

  // General game reference used by some alerts (respec/delete/death)
  const gameRef = useRef(injectedGame);
  useEffect(() => { gameRef.current = injectedGame; }, [injectedGame]);

  // Key handler references so we can remove
  const keyHandlerRef = useRef(null);

  // Helper to show a generic modal
  const showModal = useCallback(({ t = '', m = '', btns = [], options = {} } = {}) => {
    // hide other menus similarly to original
    if (mainMenu?.isVisible) mainMenu.hide?.();
    if (statMenu?.isVisible) statMenu.hideStats?.();

    setTitle(t || '');
    setMessage(m || '');
    setButtons(btns || []);
    setClosable(options.closable ?? true);
    setOverlayVisible(true);
    setVisible(true);
  }, [mainMenu, statMenu]);

  // Close & cleanup
  const closeAlert = useCallback(() => {
    // remove key listener if set
    if (keyHandlerRef.current) {
      document.removeEventListener('keydown', keyHandlerRef.current);
      keyHandlerRef.current = null;
    }
    // If rebind is waiting, resolve with null
    if (rebindResolveRef.current) {
      rebindResolveRef.current(null);
      rebindResolveRef.current = null;
    }
    setVisible(false);
    setOverlayVisible(false);
    setButtons([]);
    setTitle('');
    setMessage('');
  }, []);

  // Helper to create a button descriptor for the modal
  const makeButton = useCallback((text, onClick, opts = {}) => ({
    text,
    onClick,
    className: opts.className || '',
    disabled: !!opts.disabled
  }), []);

  // btnAlert: single-button alert (keeps API similar to original)
  const btnAlert = useCallback((messageText, titleText = 'Alert', btnText = 'OK', callback = null, options = {}) => {
    // create OK handler
    const onOk = () => {
      try { if (typeof callback === 'function') callback(); }
      finally { closeAlert(); }
    };

    showModal({
      t: titleText,
      m: messageText,
      btns: [ makeButton(btnText, onOk) ],
      options
    });

    // if closable, allow overlay click and ESC
    if (options.closable ?? true) {
      const onKey = (e) => {
        if (e.key === gameMenuKey) onOk(e);
      };
      keyHandlerRef.current = onKey;
      document.addEventListener('keydown', onKey);
    }
  }, [showModal, makeButton, closeAlert, gameMenuKey]);

  // yesNoAlert: two-button confirm dialog (similar signature)
  const yesNoAlert = useCallback((messageText, titleText = 'Confirm', confirmText = 'Yes', cancelText = 'No', yesCallback = null, noCallback = null, options = {}) => {
    const onYes = () => {
      try { if (typeof yesCallback === 'function') yesCallback(); }
      finally { closeAlert(); }
    };
    const onNo = () => {
      try { if (typeof noCallback === 'function') noCallback(); }
      finally { closeAlert(); }
    };

    showModal({
      t: titleText,
      m: messageText,
      btns: [
        makeButton(confirmText, onYes, { className: 'confirm' }),
        makeButton(cancelText, onNo, { className: 'cancel' })
      ],
      options
    });

    if (options.closable ?? true) {
      const onKey = (e) => {
        if (e.key === gameMenuKey) onNo(e);
      };
      keyHandlerRef.current = onKey;
      document.addEventListener('keydown', onKey);
    }
  }, [showModal, makeButton, closeAlert, gameMenuKey]);

  // rebindAlert: waits for keypress and resolves or calls callback
  const rebindAlert = useCallback((messageText = 'Press a key to bind', titleText = 'Rebind Key', callback = null) => {
    // close others
    if (mainMenu?.isVisible) mainMenu.hide?.();
    if (statMenu?.isVisible) statMenu.hideStats?.();

    closeAlert(); // ensure clean

    // show UI with a cancel button
    return new Promise((resolve) => {
      // show modal first
      const cancel = () => {
        cleanup();
        resolve(null);
        if (typeof callback === 'function') callback(null);
      };

      const btn = makeButton('Cancel', cancel);
      showModal({ t: titleText, m: messageText, btns: [btn], options: { closable: true } });

      // stop clicks inside modal from closing (we manage via overlay)
      // key listener to capture first non-modifier key
      const onKey = (e) => {
        if (['Shift','Control','Alt','Meta'].includes(e.key)) return;
        cleanup();
        resolve(e.key);
        if (typeof callback === 'function') callback(e.key);
        e.preventDefault();
      };

      // overlay click cancels
      const onOverlayClick = () => {
        cleanup();
        resolve(null);
        if (typeof callback === 'function') callback(null);
      };

      keyHandlerRef.current = onKey;
      document.addEventListener('keydown', onKey);

      // overlay is rendered by provider; attach a one-time click listener through state effect below
      // store resolve so cleanup can call it if provider unmounts
      rebindResolveRef.current = resolve;

      // cleanup helper
      function cleanup() {
        if (keyHandlerRef.current) { document.removeEventListener('keydown', keyHandlerRef.current); keyHandlerRef.current = null; }
        rebindResolveRef.current = null;
        closeAlert();
      }

      // attach a temporary overlay click handler via window (we'll detect overlay clicks in provider DOM)
      // to keep things simple, provider handles overlay clicks itself and calls closeOverlayClick (see below)
      overlayClickHandlerRef.current = onOverlayClick;
    });
  }, [showModal, makeButton, closeAlert, mainMenu, statMenu]);

  // We'll use refs so provider DOM parts can interact
  const overlayClickHandlerRef = useRef(null);

  // Provider's overlay click handler calls this
  const handleOverlayClick = useCallback(() => {
    // If a rebind is active, treat as cancel
    if (rebindResolveRef.current) {
      rebindResolveRef.current(null);
      rebindResolveRef.current = null;
      closeAlert();
      return;
    }
    if (closable) closeAlert();
  }, [closable, closeAlert]);

  // respecAlert - using yesNoAlert
  const respecAlert = useCallback(() => {
    const p = gameRef.current?.player;
    const game = gameRef.current;
    if (!p) {
      log('respecAlert: player not found', 'warn');
      return;
    }
    const totalPoints = p.stats.total;
    const cost = totalPoints * 100;
    yesNoAlert(
      `Respec your stats? This will refund all spent stat points and will cost you ${cost} gold. (100 gold per point spent)`,
      'Respec Stats',
      'Respec Stats',
      'Cancel',
      () => { // yes
        if (p.money < cost) {
          log(`Not enough money to respec. You need ${cost} gold but only have ${p.money}.`, 'error');
          closeAlert();
          return;
        }
        p.statPoints = (p.statPoints || 0) + totalPoints;
        p.stats = { strength: 0, greed: 0, luck: 0, intelligence: 0, vitality: 0, total: 0 };
        if (game && typeof saveDebouncedWithLeaderboard === 'function') saveDebouncedWithLeaderboard(game);
        // if stat menu exists, show
        statMenu?.showStats?.();
      },
      () => { // no
        statMenu?.showStats?.();
      },
      { closable: true }
    );
  }, [yesNoAlert, log, saveDebouncedWithLeaderboard, statMenu]);

  // deleteAlert - ask for confirmation then clear
  const deleteAlert = useCallback(() => {
    yesNoAlert(
      'Deleting save data will remove all your progress. This action cannot be undone. Are you sure you want to proceed?',
      'Delete Save',
      'Yes Delete',
      'Cancel',
      () => {
        try { stopAutoSave?.(); } catch(e){/* ignore */ }
        try { localStorage.setItem('skipSave', '1'); } catch(e){}
        try { clear(); } catch(e){/* ignore */ }
        log('Save data deleted. Reloading game...', 'system');
        closeAlert();
        setTimeout(() => location.reload(), 50);
      },
      () => {
        mainMenu?.show?.();
      },
      { closable: true }
    );
  }, [yesNoAlert, stopAutoSave, clear, log, mainMenu]);

  // deathAlert - simple countdown respawn flow
  const deathAlert = useCallback(() => {
  const game = gameRef.current;
  const player = game?.player;
  if (!player) {
    log('deathAlert: player missing', 'warn');
    return;
  }

  let seconds = 5;

  const onRespawn = () => {
    clearInterval(timer); // make sure timer stops if button is clicked
    closeAlert();
    player.respawn?.();
    game.notify();
  };

  // Initial modal
  showModal({
    t: 'YOU DIED',
    m: `Please wait ${seconds} seconds before respawning`,
    btns: [
      makeButton(`${seconds}`, onRespawn, { className: 'respawn', disabled: true })
    ],
    options: { closable: false }
  });

  // Countdown timer
  const timer = setInterval(() => {
    seconds--;

    // Update message
    setMessage(`Please wait ${seconds} seconds before respawning`);

    if (seconds > 0) {
      // update button text and keep disabled
      setButtons([ makeButton(`${seconds}`, onRespawn, { className: 'respawn', disabled: true }) ]);
    } else {
      // countdown finished, enable button
      setButtons([ makeButton('Respawn Now', onRespawn, { className: 'respawn', disabled: false }) ]);
      clearInterval(timer);
    }
  }, 1000);
}, [showModal, makeButton, closeAlert, log]);


  // Provider value
  const value = {
    visible,
    overlayVisible,
    title,
    message,
    buttons,
    closable,
    showModal,
    closeAlert,
    btnAlert,
    yesNoAlert,
    rebindAlert,
    respecAlert,
    deleteAlert,
    deathAlert,
    handleOverlayClick,
    setGameRef: (g) => { gameRef.current = g; }
  };

  // cleanup on unmount: remove any key handler
  useEffect(() => {
    return () => {
      if (keyHandlerRef.current) document.removeEventListener('keydown', keyHandlerRef.current);
      if (rebindResolveRef.current) { rebindResolveRef.current(null); rebindResolveRef.current = null; }
    };
  }, []);

  return (
    <AlertsContext.Provider value={value}>
      {children}
      {/* Render overlay + modal inside provider so any component tree can show alerts */}
      {overlayVisible && (
        <div
          id="overlay"
          className="alerts-overlay"
          onClick={() => {
            // overlay click handling: if rebind pending, cancel; else close if closable
            if (rebindResolveRef.current) {
              rebindResolveRef.current(null);
              rebindResolveRef.current = null;
              closeAlert();
            } else if (closable) {
              closeAlert();
            }
          }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999
          }}
        />
      )}

      {visible && (
        <div id="alertBox" className="alerts-modal" style={{
          position: 'fixed',
          zIndex: 10000,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 320,
          maxWidth: 680,
          background: '#111',
          color: '#fff',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
        }}>
          <h3 id="alertTitle" style={{ marginTop: 0 }}>{title}</h3>
          <div id="alertMessage" style={{ marginBottom: 12 }}>{message}</div>
          <div className="alert-buttons" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {buttons.map((b, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); if (typeof b.onClick === 'function') b.onClick(e); }}
                disabled={b.disabled}
                className={b.className}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 6,
                  cursor: b.disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {b.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </AlertsContext.Provider>
  );
}

// Hook to consume
export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}
