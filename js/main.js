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

		// close on click link
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
			const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
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

	// SERVICES: estimation builder
	const estimateTotalEl = $("#estimateTotal");
	const estimateItemsEl = $("#estimateItems");
	const estimateHint = $("#estimateHint");
	const resetBtn = $("#resetEstimate");

	const state = {
		total: 0,
		items: [], // {name, price}
	};

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

				if (isOpen) {
					panel.hidden = true;
				} else {
					panel.hidden = false;
				}
			});
		});
	});

	// PROJETS: filter + search + modal
	const chips = $$(".chip");
	const projectsGrid = $("#projectsGrid");
	const projectSearch = $("#projectSearch");

	const filterState = { tag: "all", q: "" };

	const applyProjectFilter = () => {
		if (!projectsGrid) return;
		const cards = $$(".project-card", projectsGrid);

		cards.forEach((card) => {
			const tags = (card.getAttribute("data-tags") || "").toLowerCase();
			const title = (card.getAttribute("data-title") || "").toLowerCase();
			const text = (card.textContent || "").toLowerCase();

			const matchTag =
				filterState.tag === "all" ? true : tags.includes(filterState.tag);
			const matchQ = filterState.q
				? title.includes(filterState.q) || text.includes(filterState.q)
				: true;

			card.style.display = matchTag && matchQ ? "" : "none";
		});
	};

	if (chips.length && projectsGrid) {
		chips.forEach((chip) => {
			chip.addEventListener("click", () => {
				chips.forEach((c) => c.classList.remove("is-active"));
				chip.classList.add("is-active");
				filterState.tag = chip.getAttribute("data-filter") || "all";
				applyProjectFilter();
			});
		});
	}

	if (projectSearch && projectsGrid) {
		projectSearch.addEventListener("input", () => {
			filterState.q = projectSearch.value.trim().toLowerCase();
			applyProjectFilter();
		});
	}

	// Modal open/close
	const modal = $("#projectModal");
	const modalTitle = $("#modalTitle");
	const modalTags = $("#modalTags");
	const modalDesc = $("#modalDesc");
	const modalStack = $("#modalStack");
	const modalResult = $("#modalResult");

	const openModal = (data) => {
		if (!modal) return;
		if (modalTitle) modalTitle.textContent = data.title || "Projet";
		if (modalDesc) modalDesc.textContent = data.desc || "";

		if (modalTags) {
			modalTags.innerHTML = "";
			(data.tags || []).forEach((t) => {
				const s = document.createElement("span");
				s.className = "tag";
				s.textContent = t;
				modalTags.appendChild(s);
			});
		}

		if (modalStack) {
			modalStack.innerHTML = "";
			(data.stack || []).forEach((sv) => {
				const p = document.createElement("span");
				p.className = "pill";
				p.textContent = sv;
				modalStack.appendChild(p);
			});
		}

		if (modalResult) modalResult.textContent = data.result || "";

		modal.classList.add("is-open");
		modal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	};

	const closeModal = () => {
		if (!modal) return;
		modal.classList.remove("is-open");
		modal.setAttribute("aria-hidden", "true");
		document.body.style.overflow = "";
	};

	$$(".open-project").forEach((btn) => {
		btn.addEventListener("click", () => {
			try {
				const raw = btn.getAttribute("data-project") || "{}";
				const data = JSON.parse(raw);
				openModal(data);
			} catch {
				openModal({
					title: "Projet",
					tags: [],
					desc: "Données invalides.",
					stack: [],
					result: "",
				});
			}
		});
	});

	if (modal) {
		modal.addEventListener("click", (e) => {
			const t = e.target;
			if (t && t.hasAttribute("data-close-modal")) closeModal();
		});
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && modal.classList.contains("is-open"))
				closeModal();
		});
	}

	// CONTACT: copy email + char count + validation + fake submit loading
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
	const sendBtn = $("#sendBtn");

	const setError = (fieldId, msg) => {
		const input = $("#" + fieldId);
		const field = input ? input.closest(".field") : null;
		const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
		if (!input || !field || !errorEl) return;

		if (msg) {
			field.classList.add("is-invalid");
			errorEl.textContent = msg;
		} else {
			field.classList.remove("is-invalid");
			errorEl.textContent = "";
		}
	};

	const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

	if (msg && charCount) {
		const upd = () => {
			const len = (msg.value || "").length;
			charCount.textContent = `${len} / 500`;
		};
		msg.addEventListener("input", upd);
		upd();
	}

	if (form) {
		form.addEventListener("submit", (e) => {
			e.preventDefault();

			const name = $("#name")?.value.trim() || "";
			const email = $("#email")?.value.trim() || "";
			const subject = $("#subject")?.value.trim() || "";
			const message = $("#message")?.value.trim() || "";

			let ok = true;

			if (name.length < 2) {
				setError("name", "Nom trop court (min 2).");
				ok = false;
			} else setError("name", "");
			if (!isEmailValid(email)) {
				setError("email", "Email invalide.");
				ok = false;
			} else setError("email", "");
			if (subject.length < 3) {
				setError("subject", "Sujet trop court (min 3).");
				ok = false;
			} else setError("subject", "");
			if (message.length < 10) {
				setError("message", "Message trop court (min 10).");
				ok = false;
			} else setError("message", "");

			if (!note) return;

			if (!ok) {
				note.textContent = "Corrige les champs en rouge.";
				return;
			}

			if (sendBtn) sendBtn.classList.add("is-loading");
			note.textContent = "Envoi en cours… (démo)";

			setTimeout(() => {
				if (sendBtn) sendBtn.classList.remove("is-loading");
				note.textContent =
					"Message prêt ✅ (branche un backend pour l’envoi réel)";
				form.reset();
				if (msg && charCount) charCount.textContent = "0 / 500";
			}, 900);
		});
	}

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
