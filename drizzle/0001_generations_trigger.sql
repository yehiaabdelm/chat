-- Custom SQL migration file, put your code below! --
CREATE FUNCTION update_generations_on_insert() RETURNS trigger AS $$
BEGIN
  UPDATE chats SET generations = generations + 1 WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_generations
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_generations_on_insert();