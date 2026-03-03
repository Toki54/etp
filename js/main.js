(() => {
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	// Footer year
	const yearEl = $("#year");
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	// Active nav link (multi-pages)
	const path = (
		location.pathname.split("/").pop() || "index.html"
	).toLowerCase();
	$$(".nav__link").forEach((a) => {
		const href = (a.getAttribute("href") || "").toLowerCase();
		if (href === path) a.classList.add("is-active");
	});

	// Mobile menu
	const burger = $("#burger");
	const nav = $("#nav");
	if (burger && nav) {
		burger.addEventListener("click", () => {
			const isOpen = nav.classList.toggle("is-open");
			burger.setAttribute("aria-expanded", String(isOpen));
		});

		$$(".nav__link", nav).forEach((link) => {
			link.addEventListener("click", () => {
				nav.classList.remove("is-open");
				burger.setAttribute("aria-expanded", "false");
			});
		});

		document.addEventListener("click", (e) => {
			if (!nav.classList.contains("is-open")) return;
			const t = e.target;
			const inside = nav.contains(t) || burger.contains(t);
			if (!inside) {
				nav.classList.remove("is-open");
				burger.setAttribute("aria-expanded", "false");
			}
		});
	}

	// Theme toggle (persist)
	const themeBtn = $("#themeBtn");
	const root = document.documentElement;

	const setTheme = (theme) => {
		root.setAttribute("data-theme", theme);
		try {
			localStorage.setItem("theme", theme);
		} catch {}
	};

	const initTheme = () => {
		let saved = null;
		try {
			saved = localStorage.getItem("theme");
		} catch {}
		if (saved === "light" || saved === "dark") return setTheme(saved);

		const prefersLight =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: light)").matches;
		setTheme(prefersLight ? "light" : "dark");
	};

	initTheme();

	if (themeBtn) {
		themeBtn.addEventListener("click", () => {
			const current = root.getAttribute("data-theme") || "dark";
			setTheme(current === "dark" ? "light" : "dark");
		});
	}

	// Status badge (index)
	const statusBadge = $("#statusBadge");
	if (statusBadge) {
		let on = true;
		setInterval(() => {
			on = !on;
			statusBadge.textContent = on ? "● Disponible" : "● Actif";
		}, 1400);
	}

	// Reveal on scroll
	const revealEls = $$('[data-animate="reveal"]');
	if (revealEls.length) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((en) => {
					if (en.isIntersecting) {
						en.target.classList.add("is-visible");
						io.unobserve(en.target);
					}
				});
			},
			{ threshold: 0.12 },
		);
		revealEls.forEach((el) => io.observe(el));
	}

	// Count animation (index stats)
	const countEls = $$("[data-count]");
	const animateCount = (el, to) => {
		const start = 0;
		const duration = 700;
		const t0 = performance.now();

		const step = (t) => {
			const p = Math.min(1, (t - t0) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			const val = Math.round(start + (to - start) * eased);
			el.textContent = String(val);
			if (p < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	if (countEls.length) {
		const ioCount = new IntersectionObserver(
			(entries) => {
				entries.forEach((en) => {
					if (!en.isIntersecting) return;
					const el = en.target;
					const to = Number(el.getAttribute("data-count") || "0");
					animateCount(el, to);
					ioCount.unobserve(el);
				});
			},
			{ threshold: 0.4 },
		);

		countEls.forEach((el) => ioCount.observe(el));
	}

	// Tilt effect (simple, clean)
	const tiltEls = $$("[data-tilt]");
	const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

	tiltEls.forEach((el) => {
		let rect = null;

		const onMove = (e) => {
			rect = rect || el.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;

			const rx = clamp((0.5 - y) * 6, -6, 6);
			const ry = clamp((x - 0.5) * 6, -6, 6);

			el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
		};

		const onLeave = () => {
			rect = null;
			el.style.transform = "";
		};

		el.addEventListener("mousemove", onMove);
		el.addEventListener("mouseleave", onLeave);
	});

	const estimateTotalEl = $("#estimateTotal");
	const estimateItemsEl = $("#estimateItems");
	const estimateHint = $("#estimateHint");
	const resetBtn = $("#resetEstimate");

	const state = { total: 0, items: [] };

	const animateNumber = (from, to, render) => {
		const duration = 350;
		const t0 = performance.now();
		const step = (t) => {
			const p = Math.min(1, (t - t0) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			const val = Math.round(from + (to - from) * eased);
			render(val);
			if (p < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	const renderEstimate = () => {
		if (!estimateTotalEl || !estimateItemsEl) return;

		estimateItemsEl.innerHTML = "";
		state.items.forEach((it, idx) => {
			const row = document.createElement("div");
			row.className = "estimate-item";
			row.innerHTML = `
        <div>
          <strong>${escapeHtml(it.name)}</strong>
          <div class="muted small">${it.price}€</div>
        </div>
        <button type="button" data-remove="${idx}">Retirer</button>
      `;
			estimateItemsEl.appendChild(row);
		});

		estimateItemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const i = Number(btn.getAttribute("data-remove"));
				const removed = state.items.splice(i, 1)[0];
				if (!removed) return;

				const old = state.total;
				state.total = Math.max(0, state.total - removed.price);

				animateNumber(
					old,
					state.total,
					(v) => (estimateTotalEl.textContent = String(v)),
				);
				if (estimateHint)
					estimateHint.textContent = state.items.length
						? "Tu peux retirer des éléments si besoin."
						: "Clique “Ajouter au devis” sur les cartes.";
				renderEstimate();
			});
		});
	};

	const addToEstimateBtns = $$(".add-to-estimate");
	if (addToEstimateBtns.length && estimateTotalEl && estimateItemsEl) {
		addToEstimateBtns.forEach((btn) => {
			btn.addEventListener("click", () => {
				const card = btn.closest("[data-price]");
				if (!card) return;

				const name = card.querySelector("h3")?.textContent?.trim() || "Service";
				const price = Number(card.getAttribute("data-price") || "0");

				state.items.push({ name, price });

				const old = state.total;
				state.total += price;

				animateNumber(
					old,
					state.total,
					(v) => (estimateTotalEl.textContent = String(v)),
				);
				if (estimateHint)
					estimateHint.textContent =
						"Total indicatif (hors options spécifiques).";

				btn.classList.add("btn--primary");
				setTimeout(() => btn.classList.remove("btn--primary"), 220);

				renderEstimate();
			});
		});

		if (resetBtn) {
			resetBtn.addEventListener("click", () => {
				const old = state.total;
				state.total = 0;
				state.items = [];
				animateNumber(old, 0, (v) => (estimateTotalEl.textContent = String(v)));
				if (estimateHint)
					estimateHint.textContent =
						"Clique “Ajouter au devis” sur les cartes.";
				renderEstimate();
			});
		}
	}

	// FAQ accordion
	const accordions = $$("[data-accordion]");
	accordions.forEach((acc) => {
		const btns = $$(".accordion__btn", acc);
		btns.forEach((btn) => {
			btn.addEventListener("click", () => {
				const panel = btn.nextElementSibling;
				if (!panel) return;

				const isOpen = btn.getAttribute("aria-expanded") === "true";
				btn.setAttribute("aria-expanded", String(!isOpen));
				const icon = btn.querySelector(".accordion__icon");
				if (icon) icon.textContent = isOpen ? "+" : "–";
				panel.hidden = isOpen;
			});
		});
	});

	const copyEmailBtn = $("#copyEmail");
	const contactEmail = $("#contactEmail");
	if (copyEmailBtn && contactEmail) {
		copyEmailBtn.addEventListener("click", async () => {
			const text = contactEmail.textContent.trim();
			try {
				await navigator.clipboard.writeText(text);
				copyEmailBtn.textContent = "Copié ✓";
				setTimeout(() => (copyEmailBtn.textContent = "Copier"), 900);
			} catch {
				copyEmailBtn.textContent = "Impossible";
				setTimeout(() => (copyEmailBtn.textContent = "Copier"), 900);
			}
		});
	}

	const form = $("#contactForm");
	const note = $("#formNote");
	const msg = $("#message");
	const charCount = $("#charCount");

	// Tes 2 boutons
	const sendViaGmail = $("#sendViaGmail");
	const sendViaMailto = $("#sendViaMailto");

	const setError = (fieldId, msgText) => {
		const input = $("#" + fieldId);
		const field = input ? input.closest(".field") : null;
		const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
		if (!input || !field || !errorEl) return;

		if (msgText) {
			field.classList.add("is-invalid");
			errorEl.textContent = msgText;
		} else {
			field.classList.remove("is-invalid");
			errorEl.textContent = "";
		}
	};

	const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

	const setLinksEnabled = (enabled) => {
		const apply = (el, on) => {
			if (!el) return;
			el.setAttribute("aria-disabled", on ? "false" : "true");
			el.style.pointerEvents = on ? "auto" : "none";
			el.style.opacity = on ? "1" : "0.6";
		};
		apply(sendViaGmail, enabled);
		apply(sendViaMailto, enabled);
	};

	const updateCharCount = () => {
		if (!msg || !charCount) return;
		const len = (msg.value || "").length;
		charCount.textContent = `${len} / 500`;
	};

	const computeAndUpdateLinks = (showErrors) => {
		if (!form) return false;

		const name = $("#name")?.value.trim() || "";
		const email = $("#email")?.value.trim() || "";
		const subject = $("#subject")?.value.trim() || "";
		const message = $("#message")?.value.trim() || "";

		const okName = name.length >= 2;
		const okEmail = isEmailValid(email);
		const okSubject = subject.length >= 3;
		const okMessage = message.length >= 10;

		const ok = okName && okEmail && okSubject && okMessage;

		if (showErrors) {
			setError("name", okName ? "" : "Nom trop court (min 2).");
			setError("email", okEmail ? "" : "Email invalide.");
			setError("subject", okSubject ? "" : "Sujet trop court (min 3).");
			setError("message", okMessage ? "" : "Message trop court (min 10).");
		}

		if (!ok) {
			setLinksEnabled(false);
			if (note)
				note.textContent =
					"Remplis tout : les boutons s’activeront automatiquement.";
			return false;
		}

		const to = "nico54.jeangeorges@gmail.com";
		const mailSubject = `ETP Dev - ${subject}`;
		const body = `Nom: ${name}
Email: ${email}

Message:
${message}
`;

		const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;

		const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;

		if (sendViaGmail) sendViaGmail.href = gmailUrl;
		if (sendViaMailto) sendViaMailto.href = mailtoUrl;

		setLinksEnabled(true);
		if (note) note.textContent = "Prêt ✅ choisis Gmail ou ton appli mail.";
		return true;
	};

	setLinksEnabled(false);
	updateCharCount();
	computeAndUpdateLinks(false);

	["input", "change"].forEach((evt) => {
		form?.addEventListener(evt, () => {
			updateCharCount();
			computeAndUpdateLinks(false);
		});
	});

	const guardClick = (e) => {
		const ok = computeAndUpdateLinks(true);
		if (!ok) e.preventDefault();
	};

	sendViaGmail?.addEventListener("click", guardClick);
	sendViaMailto?.addEventListener("click", guardClick);

	// Bloque submit (si ZAC appuie Entrée, anus sera dilaté)
	form?.addEventListener("submit", (e) => {
		e.preventDefault();
		computeAndUpdateLinks(true);
	});

	// Small helpers
	function escapeHtml(str) {
		return String(str)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	}
})();
