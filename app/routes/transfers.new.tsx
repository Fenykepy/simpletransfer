export default function NewTransferRoute() {
  return (
    <div>
      <h2>New Transfer</h2>
      <form method="post">
        <div>
          <label>
            To: <input type="text" name="to" />
          </label>
        </div>
        <div>
          <label>
            File: <input type="text" name="file" />
          </label>
        </div>
        <div>
          <label>
            Object: <input type="text" name="object" />
          </label>
        </div>
        <div>
          <label>
            Message: <textarea name="message" />
          </label>
        </div>
        <div>
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  )
}