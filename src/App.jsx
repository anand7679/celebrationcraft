import { useState, useMemo } from "react";
import "./App.css";

const INITIAL_EVENTS = [
  { id: 1, name: "Classic Birthday Bash", category: "Birthday", price: 15000, description: "Decor, cake and music for up to 50 guests." },
  { id: 2, name: "Sunny Haldi Ceremony", category: "Haldi", price: 25000, description: "Traditional haldi setup with floral decor." },
  { id: 3, name: "Royal Wedding Package", category: "Marriage", price: 150000, description: "Full wedding planning, venue and catering." },
  { id: 4, name: "Little Stars Baby Shower", category: "Baby Shower", price: 20000, description: "Themed decor, games and dessert table." },
];

const HOME_CATEGORIES = [
  { name: "Birthday", emoji: "🎂", text: "Make every year count." },
  { name: "Haldi", emoji: "🌼", text: "Golden joy for the big day." },
  { name: "Marriage", emoji: "💍", text: "Begin forever in style." },
  { name: "Baby Shower", emoji: "🍼", text: "Welcome the little one." },
];

const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "events", label: "Events" },
  { key: "book", label: "Book" },
  { key: "create", label: "Create" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [search, setSearch] = useState("");
  const [bookingType, setBookingType] = useState("");

  const categories = useMemo(
    () => [...new Set(events.map((e) => e.category))],
    [events]
  );

  const goBook = (category = "") => {
    setBookingType(category);
    setPage("book");
  };

  const addEvent = (newEvent) => {
    setEvents((prev) => [...prev, { ...newEvent, id: Date.now() }]);
  };

  return (
    <>
      <nav className="nav">
        <div className="brand">🎉 CelebrationCraft</div>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={page === item.key ? "active" : ""}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container">
        {page === "home" && (
          <Home
            onCategoryClick={(name) => {
              setSearch(name);
              setPage("events");
            }}
          />
        )}

        {page === "events" && (
          <Catalog
            events={events}
            search={search}
            setSearch={setSearch}
            onBook={goBook}
          />
        )}

        {page === "book" && (
          <BookingForm categories={categories} initialType={bookingType} />
        )}

        {page === "create" && (
          <CreateEvent
            categories={categories}
            onAdd={addEvent}
            onDone={() => {
              setSearch("");
              setPage("events");
            }}
          />
        )}
      </main>
    </>
  );
}

/* ---------- Home ---------- */
function Home({ onCategoryClick }) {
  return (
    <>
      <section className="hero">
        <h1>Welcome to CelebrationCraft</h1>
        <p>
          From birthdays to weddings, we help you plan personal milestones with
          beautiful packages, easy booking and custom themes made just for you.
        </p>
      </section>

      <h2>Celebrations we plan</h2>
      <div className="grid">
        {HOME_CATEGORIES.map((c) => (
          <div className="card" key={c.name}>
            <div className="emoji">{c.emoji}</div>
            <h3>{c.name}</h3>
            <p>{c.text}</p>
            <button className="btn" onClick={() => onCategoryClick(c.name)}>
              View packages
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Catalog ---------- */
function Catalog({ events, search, setSearch, onBook }) {
  const q = search.trim().toLowerCase();
  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
  );

  return (
    <>
      <h2>Event Packages</h2>
      <input
        className="search"
        type="text"
        placeholder="Search by name or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p>No events match "{search}".</p>
      ) : (
        <div className="grid">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} onBook={onBook} />
          ))}
        </div>
      )}
    </>
  );
}

function EventCard({ event, onBook }) {
  return (
    <div className="card">
      <span className="tag">{event.category}</span>
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <p className="price">Starts at ₹{event.price.toLocaleString("en-IN")}</p>
      <button className="btn" onClick={() => onBook(event.category)}>
        Book Now
      </button>
    </div>
  );
}

/* ---------- Booking Form ---------- */
const EMPTY_BOOKING = { name: "", date: "", guests: "", type: "" };

function BookingForm({ categories, initialType }) {
  const [form, setForm] = useState({ ...EMPTY_BOOKING, type: initialType });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const err = {};
    const today = new Date().toISOString().split("T")[0];
    const g = Number(form.guests);

    if (!form.name.trim()) err.name = "Name is required.";
    if (!form.date) err.date = "Event date is required.";
    else if (form.date < today) err.date = "Date cannot be in the past.";
    if (!form.guests) err.guests = "Guest count is required.";
    else if (!Number.isInteger(g) || g < 1 || g > 1000)
      err.guests = "Enter a whole number between 1 and 1000.";
    if (!form.type) err.type = "Please select a celebration type.";

    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length === 0) {
      setSubmitted(true);
      setForm({ ...EMPTY_BOOKING });
    }
  };

  return (
    <div className="form-box">
      <h2>Book Your Celebration</h2>

      {submitted && (
        <div className="success">
          ✅ Thank you! Your booking request has been submitted. We'll contact you soon.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Your Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="field">
          <label>Event Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>

        <div className="field">
          <label>Number of Guests</label>
          <input type="number" name="guests" value={form.guests} onChange={handleChange} />
          {errors.guests && <span className="error">{errors.guests}</span>}
        </div>

        <div className="field">
          <label>Celebration Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>

        <button className="btn" type="submit">Submit Booking Request</button>
      </form>
    </div>
  );
}

/* ---------- Create Package ---------- */
const EMPTY_EVENT = { name: "", category: "", price: "", description: "" };

function CreateEvent({ categories, onAdd, onDone }) {
  const [form, setForm] = useState(EMPTY_EVENT);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const err = {};
    const p = Number(form.price);
    if (!form.name.trim()) err.name = "Package name is required.";
    if (!form.category.trim()) err.category = "Category is required.";
    if (!form.price) err.price = "Base price is required.";
    else if (Number.isNaN(p) || p <= 0) err.price = "Enter a valid price greater than 0.";
    if (!form.description.trim()) err.description = "Description is required.";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    onAdd({
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      description: form.description.trim(),
    });
    setMessage("🎊 New celebration package added!");
    setForm(EMPTY_EVENT);
    setErrors({});
  };

  return (
    <div className="form-box">
      <h2>Create a Celebration Package</h2>

      {message && (
        <div className="success">
          {message}{" "}
          <button className="btn-link" onClick={onDone}>View catalog</button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Package Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="field">
          <label>Category</label>
          <input
            name="category"
            list="category-options"
            placeholder="Pick one or type a new theme"
            value={form.category}
            onChange={handleChange}
          />
          <datalist id="category-options">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          {errors.category && <span className="error">{errors.category}</span>}
        </div>

        <div className="field">
          <label>Base Price (₹)</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} />
          {errors.price && <span className="error">{errors.price}</span>}
        </div>

        <div className="field">
          <label>Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <button className="btn" type="submit">Add Package</button>
      </form>
    </div>
  );
}