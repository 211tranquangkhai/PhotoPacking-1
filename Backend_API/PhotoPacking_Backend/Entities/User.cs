namespace PhotoPacking_Backend.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
    }
}
